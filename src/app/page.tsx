'use client';

import { useState, useEffect, useRef } from 'react';
import { SentenceBuilder } from "@/components/SentenceBuilder";
import { useElasticAudio } from "@/hooks/useElasticAudio";
import { useTension } from "@/context/TensionContext";
import { useMotionValue, motion, useMotionTemplate } from "framer-motion";

export default function Home() {
  const [text, setText] = useState("TENSION");
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef(text);
  textRef.current = text; // 최신 텍스트 상태 동기화

  const { triggerSound, playExplosion } = useElasticAudio();
  const { tension, addTension, isExploding, triggerExplosion, metrics } = useTension(); // 메트릭 데이터
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 커서 후방 이동 함수
  const moveCursorToEnd = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      // 커서 위치 텍스트 끝 설정
      inputRef.current.setSelectionRange(len, len);
    }
  };

  // 엔터 키 처리 및 초기화 공통 함수
  const handleEnterKey = () => {
    if (textRef.current.length > 0) {
      triggerExplosion(); // 폭발 상태 연산
      playExplosion();   // 폭발 사운드 재생
      setText("");       // 텍스트 초기화
    }
  };

  // 1. 초기 로드 및 글로벌 키 이벤트 연동
  useEffect(() => {
    moveCursorToEnd(); // 초기 포커스 처리

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 엔터 키 입력 시 즉시 폭발 및 텍스트 초기화 처리
      if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        handleEnterKey();
        return;
      }

      // 키 입력 발생 시 텍스트 영역 포커스 보장
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('click', moveCursorToEnd); // 화면 클릭 시 포커스 이동

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('click', moveCursorToEnd);
    };
  }, [triggerExplosion, playExplosion]);

  // 키 다운 이벤트 핸들러 (줄바꿈 원천 차단)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
      e.preventDefault(); // 줄바꿈 입력 차단
      e.stopPropagation();
      handleEnterKey();
    }
  };

  // 2. 텍스트 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value.replace(/[\r\n]/g, '');

    const diff = newText.length - text.length;

    // 입력 발생 시 긴장도 증가
    addTension(0.08); 

    if (diff > 0) {
      triggerSound(0.5 + Math.random() * 0.5); 
    } else if (diff < 0) {
      triggerSound(0.2);
    }
    
    setText(newText);
  };

  // 3. 모바일 터치 스크롤 방지
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => e.preventDefault();
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.body.removeEventListener('touchmove', preventDefault);
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <main 
      className="relative w-full h-[100dvh] overflow-hidden cursor-default select-none transition-colors duration-100 ease-out touch-none"
      onClick={moveCursorToEnd} // 화면 클릭 시 포커스 이동
      style={{
        // 긴장도 연동 배경색 보간
        backgroundColor: `color-mix(in srgb, #F0F0F0 ${100 - tension * 100}%, #1a0505)`,
        // 긴장도 연동 텍스트 색상 보간
        color: `color-mix(in srgb, #111111 ${100 - tension * 100}%, #FFFFFF)`
      }}
    >
      
      {/* 폭발 시각 효과 플래시 */}
      {isExploding && (
        <div className="absolute inset-0 z-50 pointer-events-none animate-flash bg-white mix-blend-difference" />
      )}

      {/* 숨김 처리 단일행 텍스트 입력 영역 */}
      <input
        type="text"
        ref={inputRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            top: '0', // 상단 배치로 스크롤 방지
            left: '0',
            opacity: 0,
            fontSize: '16px', // iOS 줌 방지 폰트 크기
            pointerEvents: 'none', // 직접 터치 차단
        }}
        autoFocus
        spellCheck={false}
        autoComplete="off"
        inputMode="text" // 모바일 키보드 모드
      />

      {/* 배경 비네팅 레이어 */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-soft-light"
        style={{
          // 긴장도 연동 비네팅 그래디언트
          background: useMotionTemplate`radial-gradient(
            circle ${800 - tension * 400 + (isExploding ? 2000 : 0)}px at ${mouseX}px ${mouseY}px, 
            rgba(255,255,255,${0.15 + tension * 0.2}), 
            transparent ${80 - tension * 30}%
          )`
        }}
      />

      {/* 텍스트 렌더링 컨테이너 */}
      <div 
        onClick={moveCursorToEnd} // 글자 클릭 시 커서 이동
        className="absolute inset-0 w-full h-full flex flex-wrap items-center justify-center content-center z-10 p-10 cursor-text"
      >
        <SentenceBuilder text={text} />
      </div>

      {/* 하단 안내 가이드 바 */}
      <div 
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '0.65rem 1.35rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(20, 20, 20, 0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#FFFFFF',
          fontSize: '0.875rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '1rem', color: '#FBBF24' }}>🔊</span>
          <span style={{ color: '#FFFFFF' }}>소리를 켜주세요</span>
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 300 }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <kbd 
            style={{ 
              padding: '0.15rem 0.5rem', 
              borderRadius: '0.375rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              color: '#FFFFFF', 
              fontFamily: 'monospace', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)' 
            }}
          >
            Enter
          </kbd>
          <span style={{ color: '#FFFFFF' }}>입력 시 폭발 및 초기화</span>
        </span>
      </div>

    </main>
  );
}