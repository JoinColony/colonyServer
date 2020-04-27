import fs from 'fs'
import util from 'util'
import path from 'path'

const readFile = util.promisify(fs.readFile)

export interface SystemInfo {
  version: string
}

export class SystemDataSource {
  private version: Promise<string>

  constructor() {
    this.version = this.getAsyncVersion()
  }

  private async getAsyncVersion(): Promise<string> {
    const packageJson = await readFile(path.resolve('package.json'))
    const { version } = JSON.parse(packageJson.toString())
    return version
  }

  async getSystemInfo(): Promise<SystemInfo> {
    return {
      version: await this.version,
    }
  }
}
