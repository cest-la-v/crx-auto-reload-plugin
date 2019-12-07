# Chrome插件自动重载

## 特性

- 监视'manifest.json'文件的修改并输出该文件
- 开发时检测到代码修改的时候自动重新加载插件
- 生产打包时不污染输出

## 实现原理

必需webpack

### 服务端 'webpack --watch'

- 解析并修改'manifest.json'文件
    - 如果存在'background.page': 'background.page'所指的HTML尾部附加一段'&lt;script type=&quot;text/javascript&quot; src=&quot;auto-reload.js&quot;&gt;&lt;/script&gt;'
    - 否则: 在'background.scripts'中添加'auto-reload.js'
- 添加一个 'auto-reload.js' 输出

### 客户端

有了服务端的功能，webpack每次构建时必然会修改并生成'manifest.json'，所以只需监视该文件的修改即刻

- 加载时缓存当前'manifest.json'的'lastModified'属性
- 每两秒比对一次缓存的'lastModified'和最新的'lastModified'
- 如果不同则重载插件

## 安装

```bash
npm install crx-auto-reload-plugin --save-dev
// or
yarn add crx-auto-reload-plugin --dev
```

## 使用

webpack配置文件中添加如下一段

例如:

```js
const path = require('path');
const CrxAutoReloadPlugin  = require('crx-auto-reload-plugin');

module.exports = {
//...
    plugins: [
      new CrxAutoReloadPlugin({
        manifestPath: path.join(__dirname, '..', 'src', 'manifest.json') // required
      })
    ]
//...
}
```

## 参考

 + [Webpack Chrome Extension Reloader by YuraDev](https://github.com/YuraDev/wcer)
 + [crx-hotreload by xpl](https://github.com/xpl/crx-hotreload)
