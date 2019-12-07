# Chrome Extension Auto Reload Plugin

## Feature

- Watch for 'manifest.json's changes and generate the file.
- Auto reload the chrome extension on changes while developing.
- No pollution to the output while building for production.

## How it works

This is a webpack plugin, thus webpack is required.

### server side with 'webpack --watch' mode

- Parse and modify the 'manifest.json' file
    - if exists 'background.page': append a '&lt;script type=&quot;text/javascript&quot; src=&quot;auto-reload.js&quot;&gt;&lt;/script&gt;' at the end of 'background.page' HTML
    - else: add a 'auto-reload.js' to the 'background.scripts'
- Add a 'auto-reload.js' asset

### client side

With the server side, we will definitely modify and generate 'manifest.json' every time webpack builds, thus we only need to watch this one single file and reload extension while it changed.

- Cache the current 'manifest.json' file's 'lastModified' on load
- Every 2 seconds, compare the cached 'lastModified' with the newest 'lastModified'(as 'thisModified')
- Reload extension if 'lastModified' < 'thisModified'

## Installation

```bash
npm install crx-auto-reload-plugin --save-dev
// or
yarn add crx-auto-reload-plugin --dev
```

## Usage

Import and use the plugin at the plugins section of your webpack configuration file.

For example:

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

## Inspired By

 + [Webpack Chrome Extension Reloader by YuraDev](https://github.com/YuraDev/wcer)
 + [crx-hotreload by xpl](https://github.com/xpl/crx-hotreload)
