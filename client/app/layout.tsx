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
      </body>
    </html>
  );
}
