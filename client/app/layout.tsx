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
      </head>
      <body>
        <GlobalThemeHandler>
          <I18nProvider>
            <Toaster />
            {children}
          </I18nProvider>
        </GlobalThemeHandler>
      </body>
    </html>
  );
}
