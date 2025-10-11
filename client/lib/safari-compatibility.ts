// Safari compatibility utilities and polyfills

export interface BrowserInfo {
  name: string;
  version: string;
  isSafari: boolean;
  isMobile: boolean;
  supportsFlexbox: boolean;
  supportsGrid: boolean;
  supportsCustomProperties: boolean;
  supportsIntersectionObserver: boolean;
}

export class SafariCompatibility {
  private static instance: SafariCompatibility;
  private browserInfo: BrowserInfo | null = null;

  private constructor() {}

  static getInstance(): SafariCompatibility {
    if (!SafariCompatibility.instance) {
      SafariCompatibility.instance = new SafariCompatibility();
    }
    return SafariCompatibility.instance;
  }

  detectBrowser(): BrowserInfo {
    if (this.browserInfo) {
      return this.browserInfo;
    }

    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    
    // Extract version
    let version = '0';
    if (isSafari) {
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      if (match) {
        version = match[1];
      }
    }

    // Feature detection
    const supportsFlexbox = this.supportsFlexbox();
    const supportsGrid = this.supportsGrid();
    const supportsCustomProperties = this.supportsCustomProperties();
    const supportsIntersectionObserver = this.supportsIntersectionObserver();

    this.browserInfo = {
      name: isSafari ? 'Safari' : 'Other',
      version,
      isSafari,
      isMobile,
      supportsFlexbox,
      supportsGrid,
      supportsCustomProperties,
      supportsIntersectionObserver
    };

    return this.browserInfo;
  }

  private supportsFlexbox(): boolean {
    const testElement = document.createElement('div');
    testElement.style.display = 'flex';
    return testElement.style.display === 'flex';
  }

  private supportsGrid(): boolean {
    const testElement = document.createElement('div');
    testElement.style.display = 'grid';
    return testElement.style.display === 'grid';
  }

  private supportsCustomProperties(): boolean {
    const testElement = document.createElement('div');
    testElement.style.setProperty('--test', 'value');
    return testElement.style.getPropertyValue('--test') === 'value';
  }

  private supportsIntersectionObserver(): boolean {
    return 'IntersectionObserver' in window;
  }

  // Apply Safari-specific CSS fixes
  applySafariFixes(): void {
    const browserInfo = this.detectBrowser();
    
    if (browserInfo.isSafari) {
      this.addSafariStyles();
      this.fixFlexboxIssues();
      this.fixGridIssues();
      this.fixCustomProperties();
      this.fixIntersectionObserver();
    }
  }

  private addSafariStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Safari-specific fixes */
      .safari-fix {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }

      /* Fix for Safari flexbox issues */
      .safari-flex-fix {
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
      }

      /* Fix for Safari grid issues */
      .safari-grid-fix {
        display: -webkit-grid;
        display: grid;
      }

      /* Fix for Safari backdrop-filter */
      .safari-backdrop-fix {
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
      }

      /* Fix for Safari sticky positioning */
      .safari-sticky-fix {
        position: -webkit-sticky;
        position: sticky;
      }

      /* Fix for Safari text rendering */
      .safari-text-fix {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      /* Fix for Safari button styling */
      .safari-button-fix {
        -webkit-appearance: none;
        appearance: none;
        border-radius: 0;
      }

      /* Fix for Safari input styling */
      .safari-input-fix {
        -webkit-appearance: none;
        appearance: none;
        border-radius: 0;
      }

      /* Fix for Safari scrollbar */
      .safari-scrollbar-fix::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .safari-scrollbar-fix::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }

      .safari-scrollbar-fix::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
      }

      .safari-scrollbar-fix::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;
    document.head.appendChild(style);
  }

  private fixFlexboxIssues(): void {
    // Add Safari flexbox classes to elements that use flexbox
    const flexElements = document.querySelectorAll('[class*="flex"]');
    flexElements.forEach(element => {
      element.classList.add('safari-flex-fix');
    });
  }

  private fixGridIssues(): void {
    // Add Safari grid classes to elements that use grid
    const gridElements = document.querySelectorAll('[class*="grid"]');
    gridElements.forEach(element => {
      element.classList.add('safari-grid-fix');
    });
  }

  private fixCustomProperties(): void {
    // Fallback for CSS custom properties in older Safari versions
    const browserInfo = this.detectBrowser();
    if (!browserInfo.supportsCustomProperties) {
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --primary-color: #F13F33;
          --secondary-color: #063479;
          --text-color: #333333;
          --background-color: #ffffff;
          --border-color: #e5e7eb;
          --shadow-color: rgba(0, 0, 0, 0.1);
        }
      `;
      document.head.appendChild(style);
    }
  }

  private fixIntersectionObserver(): void {
    // Polyfill for IntersectionObserver in older Safari versions
    if (!this.supportsIntersectionObserver()) {
      this.loadIntersectionObserverPolyfill();
    }
  }

  private loadIntersectionObserverPolyfill(): void {
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    script.async = true;
    document.head.appendChild(script);
  }

  // Get CSS classes to apply for Safari compatibility
  getSafariClasses(): string[] {
    const browserInfo = this.detectBrowser();
    const classes: string[] = [];

    if (browserInfo.isSafari) {
      classes.push('safari-fix');
      
      if (!browserInfo.supportsFlexbox) {
        classes.push('safari-flex-fix');
      }
      
      if (!browserInfo.supportsGrid) {
        classes.push('safari-grid-fix');
      }
    }

    return classes;
  }

  // Check if a specific feature is supported
  isFeatureSupported(feature: keyof Omit<BrowserInfo, 'name' | 'version' | 'isSafari' | 'isMobile'>): boolean {
    const browserInfo = this.detectBrowser();
    return browserInfo[feature];
  }

  // Get browser-specific recommendations
  getRecommendations(): string[] {
    const browserInfo = this.detectBrowser();
    const recommendations: string[] = [];

    if (browserInfo.isSafari) {
      if (!browserInfo.supportsGrid) {
        recommendations.push('Consider using flexbox instead of CSS Grid for better Safari compatibility');
      }
      
      if (!browserInfo.supportsCustomProperties) {
        recommendations.push('Use fallback values for CSS custom properties');
      }
      
      if (browserInfo.isMobile) {
        recommendations.push('Test touch interactions and viewport settings on mobile Safari');
      }
    }

    return recommendations;
  }
}

// Export singleton instance
export const safariCompatibility = SafariCompatibility.getInstance();

// Auto-apply fixes when the DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      safariCompatibility.applySafariFixes();
    });
  } else {
    safariCompatibility.applySafariFixes();
  }
}
