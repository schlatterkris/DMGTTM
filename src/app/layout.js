import "./globals.css"; // Make sure it has the ./ 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}