# 海报提示词生成器控制台

销售端海报 Prompt Generator 静态前端包，核心入口是 `sales-prompt-console.html`。页面默认使用静态规则生成 Prompt，不需要线上 API 才能使用。

## 当前 Pages 地址

- https://haibao-generator-b5n.pages.dev/sales-prompt-console

## 页面入口

- 根路径入口：`index.html`
- 主页面：`sales-prompt-console.html`
- PostHog 示例配置：`posthog-config.example.js`

## Cloudflare Pages 构建配置

- Build command: `npm run build:pages`
- Build output directory: `dist`

也可以直接使用：

```powershell
node scripts/build-pages.js
```

## PostHog 生产环境变量

只在 Cloudflare Pages 后台配置，不写入 GitHub：

```text
HAIBAO_POSTHOG_ENABLED=true
HAIBAO_POSTHOG_KEY=PostHog Project API Key
HAIBAO_POSTHOG_HOST=PostHog Host
```

未配置环境变量时，构建产物 `dist/posthog-config.js` 会保持 `enabled=false`，页面仍可正常生成和复制 Prompt。

## 隐私边界

只允许上报 3 个手动事件：

- `haibao_console_page_view`
- `haibao_prompt_generate_clicked`
- `haibao_prompt_copy_clicked`

禁止采集：

- 用户输入正文
- `final_prompt`
- 复制文本
- `product_name/benefits/activity_info/time_info/quota_info` 原文

PostHog 必须保持：

- `autocapture=false`
- `capture_pageview=false`
- `disable_session_recording=true`

允许采集枚举值、布尔值、数量、长度分档、页面固定标识、版本标识和生成来源枚举。

## API 模式

`window.HAIBAO_API_CONFIG.enabled` 默认仍为 `false`，`fallbackToStatic=true`。当前 Pages 静态上线不启用 Worker，不请求 Python API。

## 线上验证步骤

1. 打开线上页面。
2. 在 Console 检查 `window.HAIBAO_ANALYTICS_CONFIG.enabled`。
3. 在 Network 搜索 `posthog` 或 `capture`。
4. 刷新页面一次。
5. 点击生成一次。
6. 点击复制一次。
7. 到 PostHog Events 查看 3 个事件。
8. 事件出现后，再创建 Dashboard Insight 和 Funnel。
