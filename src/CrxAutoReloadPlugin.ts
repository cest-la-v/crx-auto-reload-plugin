import {compilation, Compiler, Plugin} from 'webpack';
import AutoReloadRaw from 'raw-loader!./auto-reload'
import ejs from 'ejs';
import path from 'path';
import {ConcatSource, RawSource} from 'webpack-sources'
import Compilation = compilation.Compilation;
import Manifest = chrome.runtime.Manifest;
import CrxAutoReloadPluginOptions = limc92.CrxAutoReloadPluginOptions;

const _normalize = (p: string): string => path.normalize(p).replace(/\\/g, '/')

export default class CrxAutoReloadPlugin implements Plugin {
  private readonly isOpenTabs: boolean;
  private readonly AutoReloadSource: string;
  private enabled = false;
  private backgroundPagePath: string | undefined;

  constructor({
                interval = 2000,
                openPopup = true,
                openOptions = false,
              }: CrxAutoReloadPluginOptions) {
    this.isOpenTabs = openPopup || openOptions;
    this.AutoReloadSource = ejs.render(AutoReloadRaw, {interval, openPopup, openOptions})
  }

  apply(compiler: Compiler): void {
    compiler.hooks.watchRun.tap(CrxAutoReloadPlugin.name, (compiler) => this.watchRun(compiler))
    compiler.hooks.emit.tapAsync(CrxAutoReloadPlugin.name, (compilation, done) => this.emit(compilation, done))
  }

  watchRun(_: Compiler): void {
    if (this.enabled) {
      return;
    }
    this.enabled = true
  }

  emit({assets, outputOptions}: Compilation, done: (...args) => void): void {
    if (!this.enabled) {
      return done();
    }

    const assetKeyMap: Map<string, string> = new Map(Object.keys(assets).map(key => [_normalize(key), key]))

    // manifest.json, emit only if exists
    const manifestKey = assetKeyMap.get('manifest.json')
    if (manifestKey) {
      let dirty = false
      const manifest: chrome.runtime.Manifest = JSON.parse(assets[manifestKey].source().toString());

      // background
      if (this.hackBackground(manifest)) {
        dirty = true
      }

      // content_security_policy
      /*if (this.hackCSP(manifest)) {
        dirty = true
      }*/

      if (dirty) {
        // emit
        const manifestSource = JSON.stringify(manifest)
        assets[manifestKey] = new RawSource(manifestSource)
      }
    }

    // background.page
    if (this.backgroundPagePath) {
      const backgroundPageKey = assetKeyMap.get(this.backgroundPagePath)
      if (backgroundPageKey) {
        let autoReloadJsPath: string;
        const publicPath = outputOptions.publicPath;
        if (typeof publicPath == 'string' && path.isAbsolute(publicPath)) {
          autoReloadJsPath = publicPath + (publicPath.endsWith('/') ? '' : '/') + 'auto-reload.js'
        } else {
          autoReloadJsPath = _normalize(path.relative(path.dirname(backgroundPageKey), 'auto-reload.js'));
        }
        assets[backgroundPageKey] = new ConcatSource(
          assets[backgroundPageKey],
          `<script type="text/javascript" src="${autoReloadJsPath}"></script>`
        )
      }
    }

    // auto-reload.js, emit always so client can watch for compile
    assets['auto-reload.js'] = new RawSource(this.AutoReloadSource)

    return done()
  }

  private hackCSP(manifest: Manifest) {
    let dirty = false
    if (!manifest.content_security_policy) {
      manifest.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self';"
      dirty = true
    } else {
      manifest.content_security_policy.split(';')
        .filter((row: string) => row.trim())
        .map((row: string) => {
          row.trim().split(' ')
        })
      const cspMap: Map<string, Set<string>> = new Map()
      manifest.content_security_policy.split(';')
        .filter((line: string) => line.trim())
        .forEach((line: string) => {
          const row: string[] = line.split(' ')
            .filter(value => value.trim());
          const first = row.shift()
          if (first) {
            cspMap.set(first, new Set(row))
          }
        })

      // script-src
      let script: Set<string> | undefined = cspMap.get('script-src');
      if (!script) {
        script = new Set()
        cspMap.set('script-src', script)
      }
      if (script.has("'none'")) {
        script.delete('none')
        dirty = true
      }
      if (!script.has("'self'")) {
        script.add("'self'")
        dirty = true
      }
      if (!script.has("'unsafe-eval'")) {
        script.add("'unsafe-eval'")
        dirty = true
      }

      if (dirty) {
        const lines: string[] = []
        cspMap.forEach((value, key) => {
          lines.push([key, ...value].join(' '))
        })
        manifest.content_security_policy = lines.join(';')
      }
    }

    return dirty;
  }

  private hackBackground(manifest: Manifest) {
    let dirty = false;

    // permissions
    if (this.isOpenTabs) {
      if (!manifest.permissions) {
        manifest.permissions = ['tabs']
      } else if (!manifest.permissions.some(permission => permission.toLowerCase() === 'tabs')) {
        manifest.permissions.push('tabs')
      }
    }

    // background
    if (!manifest.background) {
      manifest.background = {
        "persistent": false
      }
      dirty = true
    }

    if (manifest.background.page) {
      // background.page
      this.backgroundPagePath = _normalize(manifest.background.page)
    } else {
      // background.scripts
      this.backgroundPagePath = undefined
      if (!manifest.background.scripts) {
        manifest.background.scripts = []
      }
      manifest.background.scripts.push('auto-reload.js')
      dirty = true
    }
    return dirty;
  }
}
