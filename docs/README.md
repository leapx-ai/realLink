# RealLink GitHub Pages

这是 RealLink 扩展的 GitHub Pages 说明页面。

## 配置 GitHub Pages

1. 进入 GitHub 仓库的 **Settings** → **Pages**
2. 在 **Source** 部分选择 **Deploy from a branch**
3. 选择 **Branch**: `main` (或 `master`)
4. 选择 **Folder**: `/docs`
5. 点击 **Save**

页面将在几分钟后部署到 `https://yourusername.github.io/realLink/`

## 本地预览

由于使用了 Tailwind CSS CDN，可以直接在浏览器打开 `index.html` 文件预览：

```bash
cd docs
open index.html
```

或使用本地服务器：

```bash
cd docs
python3 -m http.server 8000
# 访问 http://localhost:8000
```

## 自定义

- 修改 `index.html` 中的 GitHub 链接：`yourusername` 替换为实际用户名
- 上传 Chrome Web Store 后更新安装按钮链接
- 添加 Google Analytics 追踪代码（可选）
