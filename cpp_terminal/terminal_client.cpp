#include <iostream>
#include <string>
#include <curl/curl.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// ----------------- libcurl 响应回调函数 -----------------
/**
 * 这个回调函数用于接收 libcurl 返回的 HTTP 响应数据。
 * @param contents 接收到的数据指针
 * @param size 数据块的大小
 * @param nmemb 数据块的数量
 * @param userp 用户传递的指针（这里是指向 std::string 的指针，用于拼接所有返回的数据）
 * @return 实际处理的字节数
 */
static size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    size_t totalSize = size * nmemb;
    std::string* str = static_cast<std::string*>(userp);
    str->append(static_cast<char*>(contents), totalSize);
    return totalSize;
}

// ----------------- 发送聊天请求的核心函数 -----------------
/**
 * 向 Python 后端发送聊天请求
 * @param message 用户的聊天内容
 * @param model_provider 大模型提供商名称 (如 'doubao', 'deepseek')
 * @param api_key 对应模型的 API Key
 * @return 后端返回的 AI 文本回复
 */
std::string sendChatRequest(const std::string& message, const std::string& model_provider, const std::string& api_key) {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;

    // 初始化 libcurl
    curl = curl_easy_init();
    if(curl) {
        // 设置请求目标 URL，这里指向本地运行的 Python FastAPI 后端
        curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:8000/api/chat");

        // 构造 JSON 请求体
        json requestData;
        requestData["message"] = message;
        requestData["model_provider"] = model_provider;
        requestData["api_key"] = api_key;
        requestData["api_url"] = ""; // 可选的自定义URL

        std::string jsonStr = requestData.dump();

        // 设置 HTTP Header：内容类型为 JSON
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        // 设置 POST 请求数据
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonStr.c_str());

        // 设置响应的回调函数以及存放数据的缓冲区
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);

        // 执行请求
        res = curl_easy_perform(curl);

        // 检查请求是否失败
        if(res != CURLE_OK) {
            std::cerr << "curl_easy_perform() 失败: " << curl_easy_strerror(res) << std::endl;
        }

        // 清理资源
        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }

    // 尝试解析后端返回的 JSON 响应
    try {
        json responseJson = json::parse(readBuffer);
        // 如果后端返回了错误字段
        if (responseJson.contains("error") && !responseJson["error"].is_null()) {
            return "后端返回错误: " + responseJson["error"].get<std::string>();
        }
        // 返回成功时的 AI 回复
        if (responseJson.contains("reply")) {
            return responseJson["reply"].get<std::string>();
        }
    } catch (json::parse_error& e) {
        return "JSON 解析错误: " + std::string(e.what()) + "\n原始响应: " + readBuffer;
    }

    return "未知错误，未获取到回复内容";
}

// ----------------- 主程序入口 -----------------
int main() {
    std::string model_provider;
    std::string api_key;
    std::string message;

    std::cout << "========================================" << std::endl;
    std::cout << "       语音聊天系统 C++ 终端控制页      " << std::endl;
    std::cout << "========================================" << std::endl;

    // 提示用户输入基本配置（在实际产品中可以通过配置文件读取）
    std::cout << "请输入你想使用的大模型 (deepseek / doubao / xiaomi / custom): ";
    std::getline(std::cin, model_provider);
    if(model_provider.empty()) model_provider = "deepseek"; // 默认使用 deepseek

    std::cout << "请输入对应模型的 API Key: ";
    std::getline(std::cin, api_key);

    std::cout << "\n系统初始化完成！你可以开始聊天了。(输入 'exit' 退出程序)" << std::endl;

    // 进入聊天循环
    while (true) {
        std::cout << "\n[你]: ";
        std::getline(std::cin, message);

        if (message == "exit" || message == "quit") {
            std::cout << "退出终端聊天。" << std::endl;
            break;
        }

        if (message.empty()) {
            continue;
        }

        std::cout << "[系统处理中...]" << std::endl;
        // 调用封装好的 HTTP 请求函数
        std::string ai_reply = sendChatRequest(message, model_provider, api_key);
        
        std::cout << "[AI助手]: " << ai_reply << std::endl;
    }

    return 0;
}
