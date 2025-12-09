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
      this.fixCustomProperties();
      this.fixIntersectionObserver();
      this.optimizeAnimations();
      // Removed fixFlexboxIssues() and fixGridIssues() - they cause performance issues
    }
  }

  // Optimize animations for Safari - PURE CSS ONLY (no dynamic manipulation)
  private optimizeAnimations(): void {
    const style = document.createElement('style');
    style.id = 'safari-animation-optimizations';
    style.textContent = `
      @media not print {
        /* Target only Safari browsers */
        @supports (-webkit-touch-callout: none) {
          /* AGGRESSIVE: Make all animations much faster for instant feel */
          * {
            animation-duration: 0.15s !important;
            transition-duration: 0.1s !important;
            /* Use hardware-accelerated timing function */
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
          }

          /* Ultra-fast hover effects - nearly instant */
          button:hover,
          a:hover,
          [role="button"]:hover,
          .cursor-pointer:hover {
            transition-duration: 0.05s !important;
          }

          /* Disable animations on scroll containers completely */
          [class*="overflow"],
          .overflow-auto,
          .overflow-scroll,
          .overflow-y-auto,
          .overflow-x-auto {
            animation: none !important;
            transition: none !important;
          }

          /* Speed up common Tailwind animations */
          .animate-spin {
            animation-duration: 0.6s !important;
          }

          .animate-pulse {
            animation-duration: 1s !important;
          }

          /* Disable resource-heavy animations */
          .animate-bounce,
          .animate-ping {
            animation: none !important;
          }

          /* Disable Tailwind scale utility classes only (not Framer Motion inline styles) */
          .scale-0, .scale-50, .scale-75, .scale-90, .scale-95, .scale-100, .scale-105, .scale-110, .scale-125, .scale-150,
          .hover\\:scale-0:hover, .hover\\:scale-50:hover, .hover\\:scale-75:hover, .hover\\:scale-90:hover,
          .hover\\:scale-95:hover, .hover\\:scale-100:hover, .hover\\:scale-105:hover, .hover\\:scale-110:hover,
          .hover\\:scale-125:hover, .hover\\:scale-150:hover {
            transform: translateZ(0) !important;
          }

          /* Disable complex transform chains */
          [class*="rotate"],
          [class*="skew"] {
            animation: none !important;
          }

          /* Simple active state feedback - no transforms */
          button:active,
          a:active,
          [role="button"]:active {
            opacity: 0.8;
            transition-duration: 0.05s !important;
          }

          /* Force GPU acceleration on ALL interactive elements */
          button,
          a,
          [role="button"],
          input,
          select,
          textarea,
          [class*="cursor-pointer"],
          [class*="hover:"] {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            will-change: auto;
          }

          /* Optimize backdrop blur which is expensive on Safari */
          [class*="backdrop-blur"],
          .backdrop-blur-sm,
          .backdrop-blur-md,
          .backdrop-blur-lg {
            -webkit-backdrop-filter: blur(4px) !important;
            backdrop-filter: blur(4px) !important;
          }

          /* Disable gradient animations - very expensive */
          [class*="animate-gradient"] {
            animation: none !important;
          }
        }
      }
    `;
    document.head.appendChild(style);
  }

  private addSafariStyles(): void {
    const style = document.createElement('style');
    style.id = 'safari-performance-fixes';
    style.textContent = `
      /* Safari-specific fixes - OPTIMIZED FOR PERFORMANCE */

      /* Font rendering for all elements */
      body * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Minimal GPU acceleration - only for interactive elements */
      button,
      a,
      [role="button"],
      input,
      select,
      textarea {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }

      /* Optimize scrolling containers */
      [class*="overflow"],
      .overflow-auto,
      .overflow-scroll {
        -webkit-overflow-scrolling: touch;
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
