import { 
  // 영문 폰트
  Syne, 
  Anton, 
  Space_Grotesk, 
  Abril_Fatface, 
  Bebas_Neue,
  // 한글 폰트
  Black_Han_Sans,
  Do_Hyeon,
  Song_Myung,
  Hahmlet,
  Gowun_Dodum 
} from 'next/font/google';

// ----------------------------------------------------------------------
// 영문 폰트 설정
// ----------------------------------------------------------------------

// 1. Syne (가변 폰트)
export const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
  // weight: 가변 폰트 자동 설정
});

// 2. Anton (고정 폰트)
export const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-anton',
});

// 3. Space Grotesk (가변 폰트)
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
});

// 4. Abril Fatface (고정 폰트)
export const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-abril',
});

// 5. Bebas Neue (고정 폰트)
export const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-bebas',
});

// ----------------------------------------------------------------------
// 한글 폰트 설정 (용량 고려 preload false 적용)
// ----------------------------------------------------------------------

// 1. 검은고딕
export const blackHanSans = Black_Han_Sans({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-blackhan',
  preload: false, 
});

// 2. 도현
export const doHyeon = Do_Hyeon({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-dohyeon',
  preload: false,
});

// 3. 송명
export const songMyung = Song_Myung({

  weight: '400',
  display: 'swap',
  variable: '--font-song',

});

// 4. 함렛 (가변 폰트)
export const hahmlet = Hahmlet({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hahmlet',
  preload: false,
});

// 5. 고운돋움
export const gowunDodum = Gowun_Dodum({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-gowun',
  preload: false,
});