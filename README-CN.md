# Chrome插件自动重载Webpack插件

## 特性

- 开发时检测到文件修改则自动重新加载插件
- 加载时或重载时自动以标签页打开popup/options页面
- 仅当'--watch'时开启，生产打包时自动关闭，不污染输出

## 安装

```bash
npm install crx-auto-reload-plugin --save-dev
// or
yarn add crx-auto-reload-plugin --dev
```

## 使用

Import and use the plugin in your webpack configuration file.

For example, in project created by `vue-cli 3+`:

```js
// vue.config.js
const CrxAutoReloadPlugin  = require('crx-auto-reload-plugin');

module.exports = {
//...
  configureWebpack: config => {
    // ...
    config.plugins.push(
      new CrxAutoReloadPlugin(),
    )
    // ...
 }
//...
}
```

如果你需要一个用于开发Chrome插件的开箱即用的vue-cli项目生成配置，可以看看这里：

- [MightyVincent/vue-cli-preset-crx - 一个用于开发Chrome插件的vue-cli项目生成配置](https://github.com/MightyVincent/vue-cli-preset-crx)
- [MightyVincent/tidy-tabs - 一个用本Webpack插件开发的Chrome插件](https://github.com/MightyVincent/tidy-tabs)

## Options

```json5
{
    interval: 2000, // watch interval
    openPopup: true, // should open popup page after plugin load/reload
    openOptions: false, // should open options page after plugin load/reload
}
```

## How it works

### 服务器端'webpack --watch'模式下

- 检测到manifest.json输出时，如有必要则自动解析并修改该文件以注入自动重载脚本。
- 每次构建始终生成auto-reload.js文件。

### 浏览器端

- 检测到auto-reload.json文件的修改时间变化则自动调用chrome.runtime.reload().

## 参考

 + [Webpack Chrome Extension Reloader by YuraDev](https://github.com/YuraDev/wcer)
 + [crx-hotreload by xpl](https://github.com/xpl/crx-hotreload)
