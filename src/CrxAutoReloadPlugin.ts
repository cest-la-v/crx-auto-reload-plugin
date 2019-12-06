import webpack, {Plugin} from "webpack";
import path from 'path';
import {existsSync, readFileSync} from 'fs';
import logger from './logger'
import AutoReloadSource from "raw-loader!./auto-reload.js"
import {ConcatSource} from "webpack-sources";
import Compilation = webpack.compilation.Compilation;

export default class CrxAutoReloadPlugin implements Plugin {
  private readonly pluginName: string = 'CrxAutoReloadPlugin';
  private enabled: boolean = false;
  private readonly manifestPath: string;
  private manifest: Manifest;

  constructor({manifestPath}: Options) {
    if (!manifestPath) {
      throw new Error('manifestPath not specified!')
    }
    this.manifestPath = manifestPath
  }

  watchRun(compiler) {
    if (this.enabled) {
      return;
    }
    this.enabled = true
    logger.info("[CrxAutoReloadPlugin]: crx auto reload enabled.")
  }

  compile(compilationParams) {
    if (!existsSync(this.manifestPath)) {
      throw new Error('manifest file not found!')
    }
    this.manifest = JSON.parse(readFileSync(this.manifestPath, 'utf8'))
  }

  emit(compilation: Compilation, done) {
    if (this.enabled) {
      if (!this.manifest.background) {
        this.manifest.background = {}
      }

      let pagePath = this.manifest.background.page
      if (pagePath) {
        // background.page
        pagePath = path.normalize(pagePath);
        let assetPath = Object.keys(compilation.assets).find(assetPath => path.normalize(assetPath) === pagePath)
        if (!assetPath) {
          throw new Error(`background page '${pagePath}' is not found`)
        }
        compilation.assets[assetPath] = new ConcatSource(compilation.assets[assetPath],
          '<script type="text/javascript" src="auto-reload.js"></script>')

      } else {
        // background.scripts
        if (!(this.manifest.background.scripts instanceof Array)) {
          this.manifest.background.scripts = []
        }
        this.manifest.background.scripts.push('auto-reload.js')
      }

      // auto-reload.js
      compilation.assets['auto-reload.js'] = {
        source: () => AutoReloadSource,
        size: () => AutoReloadSource.length
      }
    }

    // manifest.json
    compilation.fileDependencies.add(this.manifestPath)
    let manifestSource = JSON.stringify(this.manifest)
    compilation.assets['manifest.json'] = {
      source: () => manifestSource,
      size: () => manifestSource.length
    }
    return done()
  }

  apply(compiler) {
    compiler.hooks.watchRun.tap(this.pluginName, (compiler) => this.watchRun(compiler))
    compiler.hooks.compile.tap(this.pluginName, (compilationParams) => this.compile(compilationParams))
    compiler.hooks.emit.tapAsync(this.pluginName, (compilation, done) => this.emit(compilation, done))
  }
}
