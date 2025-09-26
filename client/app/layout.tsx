import "./globals.css";
import I18nProvider from "./i18n-provider";
import NextAuthProvider from "./auth-provider";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <title>Tera Motors</title>
        {/* <link rel="icon" href="/favicon.png" type="image/png" /> */}
      </head>
      <body>
        <NextAuthProvider>
          <I18nProvider>
            <Toaster />
            {children}
          </I18nProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
