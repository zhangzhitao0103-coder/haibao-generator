# 部署与 PostHog 开启说明

本文记录 Cloudflare Pages 静态部署和 PostHog 生产采集的安全开启方式。

## 已上线 Pages

- 页面地址：https://haibao-generator-b5n.pages.dev/sales-prompt-console
- 当前形态：静态前端
- Worker：未部署
- API：默认关闭
- PostHog：通过 Pages 环境变量控制，源码默认关闭

## Cloudflare Pages 配置

- Build command: `npm run build:pages`
- Build output directory: `dist`

构建脚本会复制以下文件到 `dist`：

- `index.html`
- `sales-prompt-console.html`
- `posthog-config.example.js`
- `_headers`
- `_redirects`

并生成：

- `dist/posthog-config.js`

`dist` 是构建产物，不提交到 GitHub。

## 生产环境变量

在 Cloudflare Pages 后台添加：

```text
HAIBAO_POSTHOG_ENABLED=true
HAIBAO_POSTHOG_KEY=PostHog Project API Key
HAIBAO_POSTHOG_HOST=PostHog Host
```

不要把真实 PostHog key 写进源码、README、部署文档或 model_review 报告。

## PostHog 隐私边界

只上报 3 个手动事件：

- `haibao_console_page_view`
- `haibao_prompt_generate_clicked`
- `haibao_prompt_copy_clicked`

禁止采集用户输入正文、`final_prompt`、复制文本、`product_name/benefits/activity_info/time_info/quota_info` 原文。

必须关闭：

- autocapture
- session replay
- 默认 pageview 自动采集

只允许采集枚举、布尔、数量、长度分档和固定页面标识。

## 上线验证

1. 打开线上页面。
2. Console 检查 `window.HAIBAO_ANALYTICS_CONFIG.enabled`。
3. Network 搜索 `posthog` 或 `capture`。
4. 刷新页面一次。
5. 点击生成一次。
6. 点击复制一次。
7. 到 PostHog Events 查看 3 个事件。
8. 事件稳定出现后，创建 Dashboard Insight 和 Funnel。
