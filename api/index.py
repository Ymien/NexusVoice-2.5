import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="NexusVoice Core API")

# 配置CORS，允许前端应用和C++终端跨域请求
# 这是一个必要的安全机制，允许浏览器从不同端口或域名向此后端发起请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中建议修改为实际的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- 数据模型定义 -----------------

class ChatRequest(BaseModel):
    """
    定义从客户端接收的聊天请求结构
    """
    message: str              # 用户的语音转文字结果或直接输入的文本
    model_provider: str       # 指定使用的大模型提供商 ('glm', 'deepseek', 'doubao', 'custom')
    api_key: str              # 用于认证的API密钥
    api_url: Optional[str] = ""
    custom_model_name: Optional[str] = ""
    system_prompt: Optional[str] = "你是一个智能语音助手。请用简短、口语化、亲切的语言回答。重要：不要主动播报当前的时间和日期，除非用户明确询问。" 

class ChatResponse(BaseModel):
    """
    定义返回给客户端的聊天响应结构
    """
    reply: str                # AI的文字回复，将用于前端TTS语音播报
    error: Optional[str] = None # 错误信息，如果成功则为空

# ----------------- API 路由处理 -----------------

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    接收对话请求，根据配置将其代理转发给相应的大语言模型API。
    主要功能包括：
    1. 接收前端传入的文本、模型提供商和API Key。
    2. 根据提供商构建正确的请求URL和请求体（基于OpenAI规范的JSON格式）。
    3. 使用httpx异步发起HTTP请求。
    4. 解析返回的JSON并提取AI回答文本返回给前端。
    
    :param request: 客户端发送的 ChatRequest 对象
    :return: 包含AI回复内容的 ChatResponse 对象
    """
    try:
        # 这里统一采用类似OpenAI格式的API请求结构，因为大多数国产大模型目前都兼容OpenAI的API规范
        # 如果某些模型不兼容，可以在下面添加对应的特定的适配逻辑
        
        url = request.api_url
        model_name = "default-model"
        
        # 预设模型的映射表 (名称和各自的API KEY)
        # 为了安全，这里不硬编码 API Key，而是从环境变量中读取。
        # 请在你的部署环境（如 Vercel -> Settings -> Environment Variables）中设置以下变量：
        # - VITE_GLM_API_KEY
        # - VITE_DEEPSEEK_API_KEY
        # - VITE_DOUBAO_API_KEY
        # 允许用户在环境变量中配置自定义代理 URL，如果未配置则回退到官方地址
        preset_models = {
            "glm": {
                "name": "GLM-4.7",
                "url": os.environ.get("VITE_GLM_API_URL", "https://open.bigmodel.cn/api/paas/v4/chat/completions"),
                "key": os.environ.get("VITE_GLM_API_KEY", "")
            },
            "deepseek": {
                "name": "DeepSeek-V3.2",
                "url": os.environ.get("VITE_DEEPSEEK_API_URL", "https://api.deepseek.com/chat/completions"),
                "key": os.environ.get("VITE_DEEPSEEK_API_KEY", "")
            },
            "doubao": {
                "name": "Doubao-1.8",
                "url": os.environ.get("VITE_DOUBAO_API_URL", "https://ark.cn-beijing.volces.com/api/v3/chat/completions"),
                "key": os.environ.get("VITE_DOUBAO_API_KEY", "")
            }
        }

        # 根据不同的模型提供商设定默认的URL和模型名称
        if request.model_provider in preset_models:
            url = url or preset_models[request.model_provider]["url"]
            model_name = preset_models[request.model_provider]["name"]

            # 从环境变量中读取的Key
            provider_key = preset_models[request.model_provider]["key"]
            
            # 如果环境变量有配置，优先使用环境变量；否则使用前端传来的Key
            if provider_key:
                request.api_key = provider_key
            
            if not request.api_key:
                raise HTTPException(status_code=400, detail=f"未提供 {request.model_provider} 的 API 密钥（请在前端配置或在后端设置环境变量）")

            sys_prompt = request.system_prompt if request.system_prompt else "你是一个智能语音助手。请用简短、口语化、亲切的语言回答。"
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": request.message}
                ]
            }
        elif request.model_provider == "custom":
            if not url:
                raise HTTPException(status_code=400, detail="自定义模型必须提供 api_url")
            model_name = request.custom_model_name or "gpt-3.5-turbo"
            sys_prompt = request.system_prompt if request.system_prompt else "你是一个有用的语音助手。请用简短、口语化的语言回答。"
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": request.message}
                ]
            }
        else:
            raise HTTPException(status_code=400, detail="不支持的模型提供商")

        headers = {
            "Authorization": f"Bearer {request.api_key}",
            "Content-Type": "application/json"
        }
        
        # 使用 httpx 进行异步 HTTP 请求，提升并发性能，增加超时时间以防止网络异常报错
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)

            if response.status_code != 200:
                print(f"模型API请求失败: {response.text}")
                return ChatResponse(reply="", error=f"模型API请求失败, 状态码: {response.status_code}, 错误信息: {response.text}")

            data = response.json()
            
            # 由于统一改用了标准的 chat/completions 接口，所有的回复文本提取逻辑都可以统一为标准格式
            reply_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")

            if not reply_text:
                return ChatResponse(reply="", error="模型返回的数据格式无法解析内容: " + str(data))

            return ChatResponse(reply=reply_text)
            
    except httpx.HTTPStatusError as e:
        error_msg = str(e)
        try:
            err_json = e.response.json()
            error_msg = err_json.get("error", {}).get("message", error_msg)
        except:
            pass
        print(f"模型API请求状态失败: HTTP {e.response.status_code} - {error_msg}")
        return ChatResponse(reply="", error=f"模型API请求失败: HTTP {e.response.status_code} - {error_msg}")
    except httpx.RequestError as e:
        print(f"模型API网络请求异常: {str(e)}")
        return ChatResponse(reply="", error=f"网络请求异常: {str(e)}")
    except Exception as e:
        print(f"服务器内部错误: {str(e)}")
        # 捕获并返回任何运行时异常，避免后端崩溃
        return ChatResponse(reply="", error=f"服务器内部处理错误: {str(e)}")

@app.get("/health")
def health_check():
    """
    健康检查接口，用于检查后端服务是否正在运行
    :return: 包含运行状态的JSON对象
    """
    return {"status": "ok", "message": "Voice Chat Backend is running"}
