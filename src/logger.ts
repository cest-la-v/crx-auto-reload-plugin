import * as chalk from "chalk"

let prefix: string = '[CrxAutoReloadPlugin]: '

export default {
  log: (message?: string, ...optionalParams: any[]) => console.log(prefix + message, ...optionalParams),
  info: (message?: string, ...optionalParams: any[]) => console.info(chalk.green(prefix + message), ...optionalParams),
  warn: (message?: string, ...optionalParams: any[]) => console.warn(chalk.yellow(prefix + message), ...optionalParams),
  error: (message?: string, ...optionalParams: any[]) => console.error(chalk.red(prefix + message), ...optionalParams),
  debug: (message?: string, ...optionalParams: any[]) => console.debug(chalk.white(prefix + message), ...optionalParams)
}
