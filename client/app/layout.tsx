import Script from 'next/script';
import "./globals.css";
import I18nProvider from "./i18n-provider";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <title>TeraMotors - Auto Repair Management</title>
        <link rel="icon" href="/icon.png" type="image/png" />
        <meta name="description" content="Professional auto repair management system for TeraMotors" />
      </head>
      <body>
        <I18nProvider>
          <Toaster />
          {children}
        </I18nProvider>
        {/* Google Ads Scripts */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-17031322868" />
        <Script id="google-ads-init">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17031322868');
          `}
        </Script>
      </body>
    </html>
  );
}
