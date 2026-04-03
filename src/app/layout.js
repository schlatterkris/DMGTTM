// app/layout.js
import './globals.css';
import { Crimson_Text, MedievalSharp } from 'next/font/google';


const crimson = Crimson_Text({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'],
  variable: '--font-crimson', // This creates a CSS variable
});

const medieval = MedievalSharp({ 
  subsets: ['latin'], 
  weight: ['400'],
  variable: '--font-medieval',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${crimson.variable} ${medieval.variable}`}>
      <body>{children}</body>
    </html>
  );
}
