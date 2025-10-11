import puppeteer, { Browser, LaunchOptions } from 'puppeteer';

export interface PuppeteerConfig {
  headless: boolean;
  args: string[];
  executablePath?: string;
  cacheDirectory?: string;
}

export class PuppeteerManager {
  private static instance: PuppeteerManager;
  private browser: Browser | null = null;

  private constructor() {}

  static getInstance(): PuppeteerManager {
    if (!PuppeteerManager.instance) {
      PuppeteerManager.instance = new PuppeteerManager();
    }
    return PuppeteerManager.instance;
  }

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      await this.initialize();
    }
    return this.browser!;
  }

  private async initialize(): Promise<void> {
    // Check if browser is already running
    if (this.browser && this.browser.isConnected()) {
      console.log('Puppeteer browser already running, reusing existing instance');
      return;
    }

    const config = this.getConfig();
    
    try {
      this.browser = await puppeteer.launch(config);
      console.log('Puppeteer browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Puppeteer browser:', error);
      
      // If browser is already running error, try fallback config directly
      if (error instanceof Error && error.message.includes('already running')) {
        console.log('Browser already running, trying fallback config');
      }
      
      // Fallback configuration for production environments
      const fallbackConfig = this.getFallbackConfig();
      try {
        this.browser = await puppeteer.launch(fallbackConfig);
        console.log('Puppeteer browser initialized with fallback config');
      } catch (fallbackError) {
        console.error('Fallback Puppeteer initialization failed:', fallbackError);
        throw new Error('Failed to initialize Puppeteer browser. Please ensure Chrome is installed or configure Puppeteer properly.');
      }
    }
  }

  private getConfig(): LaunchOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDocker = process.env.DOCKER === 'true';
    
    const baseArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--password-store=basic',
      '--use-mock-keychain',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ];

    // Production-specific configurations
    if (isProduction) {
      baseArgs.push(
        '--single-process',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--disable-client-side-phishing-detection',
        '--disable-hang-monitor',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-domain-reliability',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--disable-ipc-flooding-protection'
      );
    }

    // Docker-specific configurations
    if (isDocker) {
      baseArgs.push(
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--single-process'
      );
    }

    const config: LaunchOptions = {
      headless: true,
      args: baseArgs,
      timeout: 30000,
      protocolTimeout: 30000,
    };

    // Set executable path if provided
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    // Set cache directory if provided, with process-specific identifier to avoid conflicts
    if (process.env.PUPPETEER_CACHE_DIR) {
      config.userDataDir = `${process.env.PUPPETEER_CACHE_DIR}-${process.pid}`;
    }

    return config;
  }

  private getFallbackConfig(): LaunchOptions {
    return {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--password-store=basic',
        '--use-mock-keychain'
      ],
      timeout: 60000,
      protocolTimeout: 60000,
    };
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log('Puppeteer browser closed');
      } catch (error) {
        console.error('Error closing browser:', error);
      } finally {
        this.browser = null;
      }
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.browser) {
        return false;
      }
      
      const pages = await this.browser.pages();
      return pages.length >= 0; // Basic health check
    } catch (error) {
      console.error('Puppeteer health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const puppeteerManager = PuppeteerManager.getInstance();

// Helper function to get browser with error handling
export async function getPuppeteerBrowser(): Promise<Browser> {
  try {
    return await puppeteerManager.getBrowser();
  } catch (error) {
    console.error('Failed to get Puppeteer browser:', error);
    throw new Error('PDF generation is currently unavailable. Please try again later.');
  }
}

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing Puppeteer browser...`);
  try {
    await puppeteerManager.close();
    console.log('Puppeteer browser closed successfully');
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon
