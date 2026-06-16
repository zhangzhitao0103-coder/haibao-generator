# 海报提示词生成器控制台

这是销售端海报 Prompt Generator 的静态前端包，核心入口是 `sales-prompt-console.html`。默认运行在纯静态模式，不需要构建命令，不依赖 React/Vue/Next/Vite，也不需要线上 API 才能生成 Prompt。

## 页面入口

- 主入口：`sales-prompt-console.html`
- PostHog 示例配置：`posthog-config.example.js`

## 静态模式

默认使用页面内已经验收的静态 JS 规则生成 Prompt。该模式可以直接双击 HTML 打开，也可以放到任意静态托管服务中打开。

## API 模式

页面预留 `window.HAIBAO_API_CONFIG`：

```js
window.HAIBAO_API_CONFIG = {
  enabled: false,
  endpoint: "http://127.0.0.1:8787/api/compile-prompt",
  fallbackToStatic: true,
  timeoutMs: 8000
};
```

`enabled` 默认关闭。只有人工改为 `true` 后，才会请求本地 API；请求失败时会回退到静态规则。

本地 API 测试方式：

```powershell
python poster_project/backend/local_api_server.py
```

## PostHog 配置

PostHog 默认关闭。未来如需启用，只能手动配置公开项目 key，并保持：

- autocapture 关闭
- pageview 自动采集关闭
- session replay 关闭
- 只允许 `haibao_console_page_view`、`haibao_prompt_generate_clicked`、`haibao_prompt_copy_clicked` 三个手动事件

## 隐私边界

不得采集用户输入正文、生成后的完整 Prompt、复制文本、产品名原文、卖点原文、活动/时间/名额信息原文。当前埋点只记录业务场景、选项、数量、布尔状态、来源标签和长度桶。

## 未来 Cloudflare Pages 人工设置

未来可将本目录作为静态站点来源。构建命令留空或选择 none，入口页面为 `sales-prompt-console.html`。发布前必须先运行阶段 11.7 总审计，并人工确认没有真实 key、token 或用户隐私数据。
