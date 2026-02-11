# 🔗 RealLink

<p align="center">
  <img src="public/icon128.png" width="64" height="64" alt="RealLink Logo">
</p>

<p align="center">
  <b>自动还原中文网站外链跳转拦截</b>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#支持平台">支持平台</a> •
  <a href="#安装方法">安装方法</a> •
  <a href="#使用效果">使用效果</a>
</p>

---

## ✨ 功能特性

- 🔓 **自动还原外链** - 拦截经过跳转的中间链接，直接跳转到目标网站
- 🚀 **即时生效** - 页面加载和动态内容更新时自动处理
- 🎯 **多平台支持** - 支持主流中文内容平台
- 📊 **实时统计** - 显示已处理的链接数量
- ⚡ **性能优化** - 使用 MutationObserver 高效处理动态内容
- 🛡️ **安全优先** - 仅处理可信域名，避免安全风险

## 🌐 支持平台

| 平台 | 域名 |
|------|------|
| **知乎** | `zhihu.com` |
| **掘金** | `juejin.cn` |
| **CSDN** | `csdn.net` |
| **简书** | `jianshu.com` |
| **博客园** | `cnblogs.com` |
| **微信** | `weixin.qq.com` |
| **Bilibili** | `bilibili.com` |
| **微博** | `weibo.com` |
| **百度贴吧** | `tieba.baidu.com` |
| **51CTO** | `51cto.com` |
| **InfoQ** | `infoq.cn` |
| **OSChina** | `oschina.net` |

## 📥 安装方法

### 方式一：Chrome 应用商店（推荐）

> 待上架

### 方式二：本地安装（开发者模式）

1. **克隆或下载项目**
   ```bash
   git clone <repository-url>
   cd realLink
   ```

2. **安装依赖并构建**
   ```bash
   npm install
   npm run build
   ```

3. **加载扩展到 Chrome**
   - 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/` 回车
   - 启用右上角的 **开发者模式**
   - 点击左上角的 **"加载已解压的扩展程序"** 按钮
   - 选择项目目录下的 `dist` 文件夹

4. **完成安装**
   - 建议将扩展图标固定在书签栏以便查看统计
   - 刷新目标网站页面即可生效

## 🎯 使用效果

### 转换示例

**知乎链接转换：**
```html
<!-- 转换前 -->
<a href="https://link.zhihu.com/?target=https%3A%2F%2Fgithub.com%2Fuser%2Frepo">
  GitHub 项目
</a>

<!-- 转换后 -->
<a href="https://github.com/user/repo">
  GitHub 项目
</a>
```

**掘金链接转换：**
```html
<!-- 转换前 -->
<a href="https://link.juejin.cn/?target=https%3A%2F%2Fstackoverflow.com">
  Stack Overflow
</a>

<!-- 转换后 -->
<a href="https://stackoverflow.com">
  Stack Overflow
</a>
```

### 界面展示

点击扩展图标，可以查看：
- 当前页面域名
- 已处理的链接数量
- 支持的平台列表
- 快捷设置选项

## 🛠️ 开发

### 技术栈

- TypeScript + Chrome Extension Manifest V3
- Webpack 打包
- MutationObserver 处理动态内容

### 构建命令

```bash
npm run build      # 生产构建
npm run watch      # 开发监视模式
npm run lint       # 代码检查
```

### 添加新平台支持

1. 在 `manifest.json` 的 `content_scripts[0].matches` 添加域名匹配
2. 在 `content.ts` 的 `getStrategy()` 中添加域名判断和解析逻辑

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

## 📄 许可证

[MIT License](LICENSE)

---

<p align="center">
  Made with ❤️ for a better web browsing experience
</p>
