# realLink

`<a href="https://stupidLink?target=https://realLink"></a>`
转变为
` <a href="https://realLink"></a>`

#### 还原以下平台的外链拦截

```
"matches": [
    "https://*.juejin.cn/*",
    "https://*.zhihu.com/*",
    "https://*.csdn.net/*",
    "https://*.jianshu.leichenlong.com/*"
  ],
```

#### 需自行本地安装，

打开 Chrome 浏览器，进入 扩展程序管理页面：

地址栏输入 chrome://extensions/ 然后按回车。

启用右上角的 开发者模式。

点击左上角的 "加载已解压的扩展程序" 按钮。

在弹出的文件选择窗口中，导航到项目目录，选择项目目录下的 dist 文件夹。

安装完成之后刷新页面

为了方便使用，插件最好固定在书签栏
