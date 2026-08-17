'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ElasticLetter } from './ElasticLetter';
import { 
  syne, anton, spaceGrotesk, abrilFatface, bebasNeue,
  blackHanSans, doHyeon, songMyung, hahmlet, gowunDodum 
} from '../app/fonts';

const FONT_CLASSES = [
  syne.className, anton.className, spaceGrotesk.className, abrilFatface.className, bebasNeue.className,
  blackHanSans.className, doHyeon.className, songMyung.className, hahmlet.className, gowunDodum.className
];

interface SentenceBuilderProps {
  text?: string;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({ text = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const letters = useMemo(() => {
    const safeText = text ?? "";
    const chars = safeText.split('');
    
    return chars.map((char, i) => {
      const seed = char.charCodeAt(0) + i * 1337; 
      const pseudoRandom = (seed * 9301 + 49297) % 233280;
      const normalizedRandom = pseudoRandom / 233280;
      
      const fontIndex = Math.floor(normalizedRandom * FONT_CLASSES.length);
      const font = FONT_CLASSES[fontIndex];
      const rotation = (normalizedRandom - 0.5) * 10;
      const yOffset = (seed % 30) - 15; 
      const scale = 0.9 + (seed % 30) / 100;

      return { char, font, rotation, yOffset, scale, id: `${i}-${char}` };
    });
  }, [text]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  return (
   <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        justifyContent: 'center', // 가로 중앙 정렬
        alignItems: 'center',     // 한 줄 기준 세로 중앙 정렬
        alignContent: 'center',   // 다중 행 세로 정렬
        
        // 레이아웃 크기 설정
        width: '100%', // 가로 너비 100% 설정
        height: 'auto', // 높이 자동 변경
        minHeight: '100vh', // 최소 높이 화면 기준 지정
        
        whiteSpace: 'pre-wrap', 
        pointerEvents: 'none',
        userSelect: 'none',
        
        // 여백 설정
        paddingTop: '20vh',    
        paddingBottom: '20vh',
        boxSizing: 'border-box'
      }}
    >
      
      {letters.map((item, i) => {
        if (item.char === '\n') {
            return (
                <div 
                    key={item.id} 
                    style={{ 
                        flexBasis: '100%', 
                        width: '100%',     
                        height: '0px', 
                        margin: 0, 
                        padding: 0 
                    }} 
                />
            );
        }
        
        return (
        <motion.div 
          key={item.id}
          className="relative inline-flex justify-center items-center"
          style={{ 
            fontSize: '5vw', 
            lineHeight: 1.1,
            width: 'auto',
            zIndex: 10
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ 
            opacity: 1, 
            rotate: item.rotation,
            y: `${item.yOffset}%` 
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: item.scale }}
            transition={{
                type: "spring",
                stiffness: 600,
                damping: 25,
                delay: 0
            }}
          >
            {item.char === ' ' ? (
                <span style={{ display: 'inline-block', width: '4vw', height: '1px' }}></span>
            ) : (
                <ElasticLetter 
                    char={item.char} 
                    fontClass={item.font}
                    mouseX={mouseX}
                    mouseY={mouseY}
                />
            )}
          </motion.div>
        </motion.div>
        );
      })}

      {/* 커서 스타일 설정 */}
      <motion.div
        style={{ 
            display: 'block',
            width: '4px',
            height: '5vw', 
            backgroundColor: '#FF3B00', // 포인트 컬러 설정
            marginLeft: '0.5vw', 
            flexShrink: 0, 
            alignSelf: 'center',
            marginBottom: '0.8vw'
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ 
            times: [0, 0.5, 0.5, 1],
            duration: 0.8, 
            repeat: Infinity, 
            ease: "linear" 
        }}
      />
    </div>
  );
};