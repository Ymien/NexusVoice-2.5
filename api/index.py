import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="语音聊天系统后端 (Voice Chat System Backend)")

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
    model_provider: str       # 指定使用的大模型提供商 ('doubao', 'deepseek', 'glm', 'wenxin', 'custom')
    api_key: str              # 用于认证的API密钥
    api_url: Optional[str] = "" # 接口地址（对于自定义模型或者特定端点的大模型必须提供）

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
        
        # 根据不同的模型提供商设定默认的URL和模型名称（如果前端没有提供）
        if request.model_provider == "deepseek":
            url = url or "https://api.deepseek.com/chat/completions"
            model_name = "deepseek-chat"
        elif request.model_provider == "doubao":
            url = url or "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
            model_name = "ep-20250212002344-9p47d"
        elif request.model_provider == "glm":
            url = url or "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
            model_name = "glm-4-7-251222"
        elif request.model_provider == "wenxin":
            # 如果文心一言使用 OpenAI 兼容层，则使用这个；如果原生则需要获取 Access Token（此处预留 OpenAI 兼容方式，如千帆 API 的 openai 兼容端点）
            url = url or "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions"
            model_name = "ernie-bot-turbo"
        elif request.model_provider == "custom":
            if not url:
                raise HTTPException(status_code=400, detail="自定义模型必须提供 api_url")
            model_name = "custom-model"
            
        headers = {
            "Authorization": f"Bearer {request.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": "你是一个有用的语音助手。请用简短、口语化的语言回答，因为你的回答将被转换为语音播报。"},
                {"role": "user", "content": request.message}
            ]
        }
        
        # 针对 glm 增加联网搜索工具（如果你提供的 glm 模型端点支持联网的话）
        if request.model_provider == "glm":
            payload["tools"] = [
                {
                    "type": "web_search",
                    "max_keyword": 3
                }
            ]
        
        # 使用 httpx 进行异步 HTTP 请求，提升并发性能
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code != 200:
                print(f"模型API请求失败: {response.text}")
                return ChatResponse(reply="", error=f"模型API请求失败, 状态码: {response.status_code}, 错误信息: {response.text}")
                
            data = response.json()
            # 从OpenAI兼容的响应格式中提取回复文本
            # 格式通常为: {"choices": [{"message": {"content": "回答内容"}}]}
            reply_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not reply_text:
                return ChatResponse(reply="", error="模型返回的数据格式无法解析内容")
                
            return ChatResponse(reply=reply_text)
            
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
