import type { Metadata } from "next";
import { 
  // 영문
  syne, 
  anton, 
  spaceGrotesk, 
  abrilFatface, 
  bebasNeue,
  // 한글
  blackHanSans, 
  doHyeon, 
  songMyung, 
  hahmlet, 
  gowunDodum 
} from "./fonts"; // 폰트 변수 임포트
import "./globals.css";
import { TensionProvider } from "@/context/TensionContext";

export const metadata: Metadata = {
  title: "TENSION",
  description: "Kinetic Typography Engine",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 폰트 CSS 변수 병합
  const fontVariables = `
    ${syne.variable} 
    ${anton.variable} 
    ${spaceGrotesk.variable} 
    ${abrilFatface.variable} 
    ${bebasNeue.variable}
    ${blackHanSans.variable} 
    ${doHyeon.variable} 
    ${songMyung.variable} 
    ${hahmlet.variable} 
    ${gowunDodum.variable}
  `;

  return (
    <html lang="en">
      {/* body 요소에 폰트 CSS 변수 주입 */}
      <body className={`${fontVariables} antialiased`}>
        <TensionProvider>
          {children}
        </TensionProvider>
      </body>
    </html>
  );
}