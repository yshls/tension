'use client';



import React, { useRef, useMemo } from 'react';

import { motion, useSpring, useMotionValue, useAnimationFrame, useMotionTemplate, MotionValue, useTransform } from 'framer-motion';

import { useElasticAudio } from '../hooks/useElasticAudio';
import { useTension } from '@/context/TensionContext';



interface ElasticLetterProps {

  char: string;

  fontClass: string;

  mouseX: MotionValue<number>;

  mouseY: MotionValue<number>;

}



export const ElasticLetter: React.FC<ElasticLetterProps> = ({ char, fontClass, mouseX, mouseY }) => {

  const ref = useRef<HTMLSpanElement>(null);

  const { triggerSound } = useElasticAudio();



  // 글자 코드 기반 고유 시드 생성

  const seed = useMemo(() => char.charCodeAt(0), [char]);

  

  const { personality, glitchProfile } = useMemo(() => {

    const hash = seed * 0.618033;

    const r = (Math.sin(hash) + 1) / 2;

    let p = 'chill';

    let g = 'stretch';

    if (r < 0.25) { p = 'timid'; g = 'shrink'; }

    else if (r < 0.5) { p = 'rebel'; g = 'explode'; }

    else if (r < 0.75) { p = 'drunk'; g = 'wobble'; }

    return { personality: p, glitchProfile: g };

  }, [seed]);



  const springConfig = {

    stiffness: personality === 'timid' ? 120 : personality === 'rebel' ? 300 : 200,

    damping: personality === 'drunk' ? 10 : 20

  };



  const x = useSpring(0, springConfig);

  const y = useSpring(0, springConfig);

  const skewX = useSpring(0, springConfig);

  const weight = useSpring(400, { stiffness: 100, damping: 20 });

  const width = useSpring(100, { stiffness: 100, damping: 20 });

  const slant = useMotionValue(0);



  const lastPos = useRef({ x: 0, y: 0 });

  const lastTime = useRef(0);

  const panicLevel = useRef(0);



  const n = useMemo(() => {
     return {
        jitter: (seed % 100) / 100, // 0~1
     }
  }, [seed]);

  const { tension } = useTension(); // 긴장도 컨텍스트

  useAnimationFrame((time) => {

    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;

    const centerY = rect.top + rect.height / 2;

    const mx = mouseX.get();

    const my = mouseY.get();

    const dt = Math.max(1, time - lastTime.current);

    const vx = (mx - lastPos.current.x) / dt;

    const vy = (my - lastPos.current.y) / dt;

    const velocity = Math.sqrt(vx * vx + vy * vy) * 1000;

    const dx = mx - centerX;

    const dy = my - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);

    const maxDist = 280;

    // 자율 신경 모션 시스템 연산

    // 1. 심장 박동 연산 및 긴장도 비례 속도 조절
    const pulseSpeed = 0.002 + (tension * 0.02);
    const pulse = Math.sin(time * pulseSpeed) * 0.5 + 0.5;

    // 2. 글자별 유영 위치 및 긴장도 비례 진폭 계산
    const tensionAmp = 1 + (tension * 5);
    const driftX = (Math.sin(time * 0.001 + seed) * 15 + Math.cos(time * 0.0005 + seed) * 10) * tensionAmp;
    const driftY = (Math.cos(time * 0.0012 + seed) * 20 + Math.sin(time * 0.0007 + seed) * 12) * tensionAmp;

    // 3. 긴장도 연동 떨림 효과
    const jitterX = (Math.random() - 0.5) * tension * 20; 
    const jitterY = (Math.random() - 0.5) * tension * 20;

    // 4. 자율 글리치 발생 조건 검사
    const selfPanic = Math.random() > (0.998 - tension * 0.1) ? 5 : 0;

    if (dist < maxDist) {

      const power = Math.max(0, 1 - dist / maxDist);

      const shearFactor = vx * power * -0.15;

      if (velocity > 1500) {

        panicLevel.current = Math.min(panicLevel.current + 1, 10);

        triggerSound(power + tension * 0.5); // 긴장도 비례 볼륨 조절

        switch (glitchProfile) {

          case 'shrink': weight.set(200); width.set(50); break;

          case 'explode': weight.set(900); width.set(150); x.set(dx * 2 + (Math.random() - 0.5) * 30); break;

          case 'wobble': skewX.set(shearFactor * 5); y.set(dy * 0.8 + Math.sin(time * 0.1) * 30); break;

          default: weight.set(100); width.set(200); break;

        }

      } else {

        const magnetStrength = personality === 'rebel' ? 1.4 : 0.8;

        // 마우스 근접 시 유영 및 자성 합성
        x.set(dx * power * magnetStrength * 0.5 + driftX * (1 - power) + jitterX);
        y.set(dy * power * 0.5 + driftY * (1 - power) + jitterY);

        skewX.set(shearFactor);

        weight.set(400 + power * 400 + pulse * 50 + tension * 200); // 긴장도 비례 폰트 두께 증가

      }

    } else {

      // 마우스 부재 시 자율 모드
      x.set(driftX + jitterX);
      y.set(driftY + jitterY);

      skewX.set(Math.sin(time * 0.001 + seed) * 5 + jitterX * 0.5);
      
      // 박동 연동 두께 및 너비 가변
      weight.set(400 + pulse * 150 + Math.sin(time * 0.005 + seed) * 30 + tension * 300);
      width.set(100 + pulse * 20 - tension * 30); // 긴장도 비례 너비 수축
      
      // 자발적 미세 패닉 발생
      if (selfPanic > 0) {
        panicLevel.current = selfPanic;
        if (Math.random() > 0.5) triggerSound(0.1 + tension * 0.2);
      }
      
      if (panicLevel.current > 0) panicLevel.current *= 0.94;

    }

    slant.set(Math.sin(time * 0.002 + (seed % 10)) * 8);

    lastPos.current = { x: mx, y: my };

    lastTime.current = time;

  });



  const fontVariationSettings = useMotionTemplate`'wght' ${weight}, 'wdth' ${width}, 'slnt' ${slant}`;

  

  // 글리치 필터 연산
  const filter = useTransform(
    () => {
      if (panicLevel.current > 3) {
        const ox = (Math.random() - 0.5) * panicLevel.current * 2;
        const oy = (Math.random() - 0.5) * panicLevel.current * 2;
        return `drop-shadow(${ox}px ${oy}px 0px #FF3B00) blur(${panicLevel.current > 7 ? 1 : 0}px)`;
      }
      return 'none';
    }
  );

  return (
    <motion.span
      ref={ref}
      className={`inline-block select-none cursor-none ${fontClass} text-[10vw] leading-none tracking-tighter will-change-transform`}
      style={{
        x,
        y,
        skewX,
        fontVariationSettings,
        filter,
        zIndex: 10,

        // 두께 연동 미세 스케일 변화
        scale: useTransform(weight, [400, 900], [1, 1.05]),

        // 긴장도 0.9 이상 시 와이어프레임 모드 전환
        color: tension > 0.9 
            ? 'transparent' // 내부 투명 처리
            : tension > 0.8 ? '#FFFFFF' : 'currentColor',

        WebkitTextStroke: tension > 0.9 ? '1px rgba(255,255,255,0.8)' : '0px',
        
        textShadow: tension > 0.1 && tension <= 0.9 // 와이어프레임 비적용 시 RGB 분리 섀도우 설정
            ? `${tension * 4}px 0px 0px rgba(255,0,0,${tension * 0.8}), 
               ${-tension * 4}px 0px 0px rgba(0,255,255,${tension * 0.8})`
            : 'none'

      }}

    >

      {char === ' ' ? '\u00A0' : char}

    </motion.span>

  );

};


