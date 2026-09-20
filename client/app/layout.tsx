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
        <title>تيرا موتور</title>
        <link rel="icon" href="/tenant-logos/teramotors-logo-transparent.png" type="image/png" />
        <link rel="apple-touch-icon" href="/tenant-logos/teramotors-logo-transparent.png" />
        <meta name="description" content="مركز تيرا موتور لصيانة السيارات" />
        <meta property="og:title" content="تيرا موتور" />
        <meta property="og:description" content="مركز تيرا موتور لصيانة السيارات" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/tenant-logos/teramotors-logo-transparent.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="تيرا موتور" />
        <meta name="twitter:description" content="مركز تيرا موتور لصيانة السيارات" />
        <meta name="twitter:image" content="/tenant-logos/teramotors-logo-transparent.png" />
        {/* Google Ads Conversion Tracking */}
        <Script id="google-ads-conversion" strategy="afterInteractive">
          {`
            gtag('event', 'conversion', {'send_to': 'AW-18198070383/Lml7CMyC9sUaEPS3lbk_'});
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