# Chrome Extension Auto Reload Webpack Plugin

## !!!Deprecated!!!

You don't need this anymore, nowadays, unpacked extensions loaded in developer mode use the files from filesystem directly, thus, unless you made a `manifest.json` change, you only need to reload the extension's page to get the newest changed files.

Recommend using [quasar](https://quasar.dev/quasar-cli-vite/developing-browser-extensions/introduction#introduction) for extension development.

## Feature

- Auto reload the chrome extension on changes while developing.
- Auto open up popup/options page in tab after plugin load/reload.
- No pollution to the output while building for production, only works with '--watch'.

## Installation

```bash
npm install crx-auto-reload-plugin --save-dev
// or
yarn add crx-auto-reload-plugin --dev
```

## Usage

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

Check these out, if you want a out-of-box vue-cli preset for chrome extension develop:

- [MightyVincent/vue-cli-preset-crx - A vue-cli project preset for chrome extension](https://github.com/MightyVincent/vue-cli-preset-crx)
- [MightyVincent/tidy-tabs - A chrome extension developed with this plugin](https://github.com/MightyVincent/tidy-tabs)

## Options

```json5
{
    interval: 2000, // watch interval
    openPopup: true, // should open popup page after plugin load/reload
    openOptions: false, // should open options page after plugin load/reload
}
```

## How it works

### server side with 'webpack --watch' mode

- Parse and modify the 'manifest.json' asset if exists to inject auto reload script.
- Always generate a 'auto-reload.js' asset in every build, for watching changes.

### client side

- Watch for 'auto-reload.json' file's 'lastModified' change and auto call chrome.runtime.reload().

## Inspired By

 + [Webpack Chrome Extension Reloader by YuraDev](https://github.com/YuraDev/wcer)
 + [crx-hotreload by xpl](https://github.com/xpl/crx-hotreload)
