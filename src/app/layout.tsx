import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { AgeGateWrapper } from "@/components/AgeGateWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import "./globals.css";


export const metadata = {
  title: "The Cliff",
  description: "Live streaming platform",
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <SocketProvider>
                <AgeGateWrapper>
                  <Navbar />
                  <main>{children}</main>
                </AgeGateWrapper>
              </SocketProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}