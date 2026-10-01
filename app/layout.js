import { Share_Tech_Mono, VT323 } from "next/font/google";
import "98.css";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  variable: "--font-terminal",
  weight: "400",
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Federico Rodriguez Franco — FRF-98",
  description:
    "Portafolio de Federico Rodriguez Franco, ingeniero de sistemas. Un sistema operativo retro estilo Windows 98.",
  icons: {
    icon: "/images/misc/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${shareTechMono.variable} ${vt323.variable}`}>
      <body>{children}</body>
    </html>
  );
}
