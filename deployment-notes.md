# 部署前说明

本文只用于未来人工发布准备，本阶段不执行任何线上操作。

## Cloudflare Pages 建议

- 项目类型：静态站点
- 构建命令：留空或 none
- 输出目录：`github-haibao-generator`，或在仓库迁移后按实际根目录选择静态前端目录
- 入口页面：`sales-prompt-console.html`

## Worker 建议

- 方案：使用 `poster_project/backend/worker_adapter` 中的 Python Worker adapter 语义
- 健康检查：`/api/health`
- 编译接口：`/api/compile-prompt`
- CORS：上线前人工收紧允许来源

## 环境变量占位

当前仓库不写真实 PostHog key、Cloudflare token、GitHub token 或账号配置。未来只允许在托管平台后台手动填写。

## PostHog 手动激活

未来如需激活，复制 `posthog-config.example.js` 的结构，填入平台后台提供的公开项目 key，并保持 autocapture、自动 pageview、session replay 全部关闭。

## 禁止项

- 禁止提交真实 key/token
- 禁止采集用户输入正文
- 禁止采集生成后的完整 Prompt
- 禁止采集复制文本
- 禁止把本项目改造成框架构建项目

## 发布前检查

发布前必须重新运行阶段 11.7 总审计，确认静态模式可独立使用、API 默认关闭、PostHog 默认关闭、fallback 可用、报告无 error。
