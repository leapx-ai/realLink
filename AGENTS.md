# RealLink - AI 编码助手指南

## 项目概述

RealLink 是一个基于 Chrome Extension Manifest V3 的浏览器扩展，使用 TypeScript 开发。它的主要功能是自动修改特定中文网站（掘金、知乎、CSDN、简书）上的外链，将经过跳转拦截的链接还原为原始链接。

例如：
- 转换前：`<a href="https://link.zhihu.com/?target=https://realLink">`
- 转换后：`<a href="https://realLink">`

## 技术栈

- **语言**: TypeScript 5.0+
- **运行环境**: Chrome 浏览器扩展 (Manifest V3)
- **模块系统**: ES6 Modules
- **编译目标**: ES6
- **包管理器**: Yarn
- **代码检查**: ESLint + @typescript-eslint

## 项目结构

```
realLink/
├── content.ts          # 内容脚本 - 页面链接处理逻辑
├── popup.ts            # 弹出窗口脚本
├── popup.html          # 弹出窗口 HTML
├── background.ts       # 后台服务脚本 (Service Worker)
├── manifest.json       # 扩展清单文件
├── tsconfig.json       # TypeScript 配置
├── package.json        # 项目依赖和脚本
├── dist/               # 构建输出目录
│   ├── content.js
│   ├── popup.js
│   ├── background.js
│   ├── popup.html
│   └── manifest.json
└── public/             # 图标资源
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    ├── icon64.png
    ├── icon128.png
    └── icon256.png
```

## 架构设计

### 1. 内容脚本 (content.ts)

使用**策略模式**处理不同域名的链接替换规则：

- `LinkReplacementStrategy` 接口：定义链接替换策略
- `TargetHrefStrategy`：处理知乎、掘金、简书的链接（提取 target 参数）
- `TargetCSDNHrefStrategy`：处理 CSDN 的特殊逻辑（包括元素替换为可点击 span）
- `DefaultStrategy`：默认空策略
- `LinkReplacementContext`：策略上下文，执行具体策略

使用 `MutationObserver` 监听 DOM 变化，动态处理新增链接。

### 2. 后台脚本 (background.ts)

Service Worker，处理扩展图标点击事件，向当前标签页注入内容脚本。

### 3. 弹出窗口 (popup.ts / popup.html)

简单的弹出 UI，显示当前页面域名。

### 4. 清单文件 (manifest.json)

- Manifest V3 格式
- 权限：`activeTab`, `scripting`
- 内容脚本匹配域名：
  - `*.juejin.cn/*`
  - `*.zhihu.com/*`
  - `*.csdn.net/*`
  - `*.jianshu.leichenlong.com/*`

## 构建和开发

### 可用命令

```bash
# 构建项目（编译 + 复制文件）
npm run build

# 仅编译 TypeScript
npx tsc

# 复制静态文件到 dist
npm run copy

# 监视模式开发
npm run watch

# 代码检查
npm run lint
```

### 构建流程

1. TypeScript 编译器将 `*.ts` 文件编译到 `dist/` 目录
2. `copyfiles` 将 `*.html` 和 `manifest.json` 复制到 `dist/`
3. 安装依赖时自动执行 `prepare` 钩子进行构建

### TypeScript 配置

- 目标：ES6
- 模块：ES6
- 严格模式：启用
- 包含文件：`*.ts`（项目根目录下的所有 TypeScript 文件）

## 代码风格指南

### 命名规范

- 类名：PascalCase（如 `TargetHrefStrategy`）
- 接口名：PascalCase（如 `LinkReplacementStrategy`）
- 函数名：camelCase（如 `applyLinkReplacement`）
- 私有属性：无前缀，通过访问修饰符控制

### 类型安全

- 启用 `strict: true`，要求显式类型声明
- DOM 元素查询使用泛型指定类型：`document.querySelectorAll<HTMLAnchorElement>("a")`
- 使用非空断言操作符 `!` 谨慎（如 `tabs[0].url!`）

### 注释风格

- 使用中文注释说明业务逻辑
- 关键算法和正则表达式需要解释其用途

## 安装和测试

### 开发环境安装

1. 构建项目：
   ```bash
   npm run build
   ```

2. 在 Chrome 中加载扩展：
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目目录下的 `dist` 文件夹

3. 刷新目标网页查看效果

### 调试

- 内容脚本：在页面开发者工具的" Sources"面板中查看
- 后台脚本：在扩展管理页面点击"Service Worker"查看
- 弹出窗口：右键点击扩展图标，选择"检查弹出窗口"

## 扩展开发注意事项

### Manifest V3 限制

- 后台脚本使用 Service Worker，不持久运行
- 内容脚本与页面共享 DOM，但 JavaScript 上下文隔离
- 需要通过消息传递与后台脚本通信（如需）

### 安全考虑

- 内容脚本只注入到匹配的 HTTPS 域名
- 避免处理不可信的外部链接，防止 XSS
- `decodeURIComponent` 使用前确保 URL 格式正确

### 添加新域名支持

1. 在 `manifest.json` 的 `content_scripts[0].matches` 添加匹配模式
2. 在 `getStrategy()` 函数中添加域名判断和对应策略
3. 如需新逻辑，创建新的 Strategy 类实现 `LinkReplacementStrategy` 接口

## 依赖管理

- 所有依赖均为开发依赖（`devDependencies`）
- 无运行时依赖，保持扩展轻量
- 使用 Yarn 锁定版本（`yarn.lock`）

---

*最后更新：2026-02-11*
