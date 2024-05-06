import Navbar from "./Navbar";
import Footer from "./Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dracula">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
