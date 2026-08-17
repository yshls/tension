'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface TensionContextType {
  tension: number;        // 0.0 ~ 1.0 수치 범위
  isExploding: boolean;   // 폭발 상태 플래그
  metrics: {              // 세션 메트릭 데이터
    totalKeystrokes: number;
    maxTension: number;
    duration: number;
  };
  addTension: (amount: number) => void;
  resetTension: () => void;
  triggerExplosion: () => boolean;
}

const TensionContext = createContext<TensionContextType | undefined>(undefined);

export const TensionProvider = ({ children }: { children: ReactNode }) => {
  const [tension, setTension] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  
  // 메트릭 상태
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [maxTension, setMaxTension] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // 긴장도 추가 연산
  const addTension = useCallback((amount: number) => {
    setTension(prev => {
        const next = Math.min(prev + amount, 1.0);
        setMaxTension(m => Math.max(m, next)); // 최고 긴장도 갱신
        return next;
    });
    setTotalKeystrokes(prev => prev + 1);
    
    // 세션 시작 시간 갱신
    if (tension === 0 && totalKeystrokes === 0) {
        setStartTime(Date.now());
    }
  }, [tension, totalKeystrokes]);

  // 긴장도 초기화
  const resetTension = useCallback(() => {
    setTension(0);
  }, []);

  // 폭발 트리거 연산
  const triggerExplosion = useCallback(() => {
    setIsExploding(true);
    setTension(0); // 긴장도 감소 처리
    
    setTimeout(() => {
        setIsExploding(false);
        // 메트릭 데이터 초기화
        setTotalKeystrokes(0);
        setMaxTension(0);
        setStartTime(Date.now());
    }, 200);
    
    return true;
  }, []);

  // 긴장도 자연 감쇄 연산
  useEffect(() => {
    if (tension <= 0) return;

    const interval = setInterval(() => {
      setTension(prev => Math.max(0, prev - 0.005)); 
    }, 50); 

    return () => clearInterval(interval);
  }, [tension]);

  return (
    <TensionContext.Provider value={{ 
        tension, 
        isExploding, 
        metrics: {
            totalKeystrokes,
            maxTension,
            duration: (Date.now() - startTime) / 1000
        },
        addTension, 
        resetTension, 
        triggerExplosion 
    }}>
      {children}
    </TensionContext.Provider>
  );
};

export const useTension = () => {
  const context = useContext(TensionContext);
  if (!context) {
    throw new Error('useTension must be used within a TensionProvider');
  }
  return context;
};
