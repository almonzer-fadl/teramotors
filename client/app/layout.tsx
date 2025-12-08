import Script from 'next/script';
import "./globals.css";
import I18nProvider from "./i18n-provider";
import { Toaster } from "react-hot-toast";
import GlobalThemeHandler from "@/components/GlobalThemeHandler";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-english">
      <head>
        <title>TeraMotors - Auto Repair Management</title>
        <link rel="icon" href="/icon.png" type="image/png" />
        <meta name="description" content="Professional auto repair management system for TeraMotors" />
        {/* Google Ads Conversion Tracking */}
        <Script id="google-ads-conversion" strategy="afterInteractive">
          {`
            gtag('event', 'conversion', {'send_to': 'AW-17031322868/Lml7CMyC9sUaEPS3lbk_'});
          `}
        </Script>
      </head>
      <body>
        <GlobalThemeHandler>
          <I18nProvider>
            <Toaster />
            {children}
          </I18nProvider>
        </GlobalThemeHandler>
        {/* Google Ads Scripts */}
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`} />
        <Script id="google-ads-init">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}