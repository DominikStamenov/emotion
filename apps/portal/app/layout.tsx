import type { Metadata } from "next";
import { MotionProvider } from "@repo/motion";

import { AuthHashHandler } from "../components/auth-hash-handler";
import "@repo/ui/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Client Portal · eMotion",
    template: "%s · eMotion Client Portal",
  },
  description: "Private project, deliverable and feedback workspace.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthHashHandler />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
