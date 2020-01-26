import { version } from '../../package.json';

export interface SystemInfo {
  version: string
}

export class SystemSource {
  private readonly version: string;

  constructor() {
    this.version = version;
  }

  async getSystemInfo(): Promise<SystemInfo> {
    return {
      version: this.version,
    };
  }
}
