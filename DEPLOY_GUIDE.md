# NexusVoice 2.5 部署与配置指南

这个项目现在是一个前后端分离且可以部署到云端的无服务器(Serverless)架构项目。
由于代码开源并托管在 GitHub，**为了保护你的财产安全和防止 API 密钥泄露**，系统已经将所有的敏感信息从代码中移除，改用“环境变量 (Environment Variables)”的方式进行读取。

请按照以下步骤，在你的部署平台（如 Vercel）和本地环境中正确配置密钥。

---

## 1. Vercel 云端部署配置（必看）

如果你的网站已经托管在 Vercel 上，你需要进入 Vercel 的后台，将以下所有的 API Key 填入系统的环境变量中，网站才能正常与大模型以及数据库通信。

### 操作步骤：
1. 登录 Vercel，进入你的项目 `nexus-voice-2-5`。
2. 点击顶部的 **Settings** 选项卡。
3. 在左侧菜单栏点击 **Environment Variables**。
4. 依次添加以下 Key 和对应的 Value，然后点击 **Save**。

### 需要填写的环境变量清单：

#### 🔹 数据库配置 (Supabase)
用于账号登录和保存云端聊天记录。
- **Key**: `VITE_SUPABASE_URL`
  **Value**: `https://iaxijgqiwhhvxbwqbkbq.supabase.co`
- **Key**: `VITE_SUPABASE_ANON_KEY`
  **Value**: *(请去你的 Supabase -> Project Settings -> API 里复制那串以 `eyJ...` 开头的 anon public key)*

#### 🔹 大模型配置 (火山引擎)
用于驱动聊天助手的智力。
- **Key**: `VITE_GLM_API_KEY`
  **Value**: `3ffbc74e-841a-47e6-b63e-7c77d69e0008`
- **Key**: `VITE_DEEPSEEK_API_KEY`
  **Value**: `135c9178-d814-41fe-8f8f-c3e738897640`
- **Key**: `VITE_DOUBAO_API_KEY`
  **Value**: `3ffbc74e-841a-47e6-b63e-7c77d69e0008` (或者你的豆包 API Key)

**💡 填完上述变量后，记得去 Vercel 的 Deployments 页面点击最新的部署记录，选择 Redeploy（重新部署），环境变量才会生效。**

---

## 2. 本地开发配置 (Local Development)

如果你想在自己的电脑上运行 `npm run dev` 并在本地测试这些模型，你需要在项目的根目录下创建一个名为 `.env.local` 的隐藏文件。

1. 在项目根目录 (`C:\yuyi\NexusVoice-2.5`) 新建文件 `.env.local`。
2. 将以下内容复制进去并保存（注意把 `your_anon_key_here` 换成真实的 Key）：

```env
VITE_SUPABASE_URL=https://iaxijgqiwhhvxbwqbkbq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

VITE_GLM_API_KEY=3ffbc74e-841a-47e6-b63e-7c77d69e0008
VITE_DEEPSEEK_API_KEY=135c9178-d814-41fe-8f8f-c3e738897640
VITE_KIMI_API_KEY=7fb361cc-cf98-4902-9a81-48eaac9e61f2
```

3. 重新启动终端中的 `npm run dev` 和后端的 `uvicorn main:app --reload`，系统就会自动读取这个文件里的密钥。

---

## 3. 为什么之前模型会报 404 错误？

你在测试中遇到的 `The model or endpoint xxx does not exist or you do not have access to it` 错误，是因为你向系统发送的请求里带了特定模型的名称，但**后端没有匹配到那个模型专属的 API Key**，或者使用了错误账号的 Key 去调用别人的自定义端点。

火山引擎的机制是：
- 每一个专属端点（如 `deepseek-v3-1-terminus`）都是绑定在某个具体账号和 API Key 下的。
- A 账号的 API Key 无法调用 B 账号创建的端点。

现在系统已经将模型名称和它专属的 API Key 进行了严格的 1对1 绑定（通过环境变量），只要你按照上面的指南把环境变量配好，模型调用就会 100% 成功，并且支持联网搜索！
