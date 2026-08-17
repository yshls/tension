import { useRef, useCallback } from 'react';

/**
 * useElasticAudio
 * 묵직한 물방울 오디오 효과 훅
 */
export const useElasticAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const triggerSound = useCallback((volume: number = 0.4) => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // 긴장도 및 기본 볼륨 계산
    const tension = Math.max(0, volume - 1); 
    const baseVolume = Math.min(volume, 1.0);

    const t = ctx.currentTime;

    // 1. 메인 물방울 소리 생성
    const dropOsc = ctx.createOscillator();
    dropOsc.type = 'sine'; // 사인파 타입 설정
    
    const dropGain = ctx.createGain();
    
    // 긴장도 비례 피치 상승
    const dropFreq = 150 + (Math.random() * 150) + (tension * 200);
    dropOsc.frequency.setValueAtTime(dropFreq, t);
    // 피치 하강 감쇄
    dropOsc.frequency.exponentialRampToValueAtTime(dropFreq * 0.4, t + 0.3);
    
    dropGain.gain.setValueAtTime(0, t);
    dropGain.gain.linearRampToValueAtTime(baseVolume * 0.7, t + 0.01);
    dropGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    
    dropOsc.connect(dropGain);
    dropGain.connect(ctx.destination);

    // 2. 공명 울림 소리 생성
    const resOsc = ctx.createOscillator();
    resOsc.type = 'sine';
    
    const resGain = ctx.createGain();
    
    // 긴장도 비례 공명 변조
    const resFreq = dropFreq * (2 + tension * 0.5); 
    resOsc.frequency.setValueAtTime(resFreq, t);
    resOsc.frequency.exponentialRampToValueAtTime(resFreq * 0.5, t + 0.25);
    
    resGain.gain.setValueAtTime(0, t);
    resGain.gain.linearRampToValueAtTime(baseVolume * 0.3, t + 0.02);
    resGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    
    resOsc.connect(resGain);
    resGain.connect(ctx.destination);

    // 3. 물 튀김 노이즈 생성
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      const decay = Math.exp(-i / (noiseData.length * 0.3));
      // 긴장도 비례 노이즈 거칠기 조정
      noiseData[i] = (Math.random() * 2 - 1) * (0.2 + tension * 0.5) * decay;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(baseVolume * (0.4 + tension), t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 사운드 재생 연산
    dropOsc.start(t);
    dropOsc.stop(t + 0.3);
    resOsc.start(t);
    resOsc.stop(t + 0.25);
    noiseSource.start(t);

  }, [initAudio]);

  // 폭발 사운드 재생
  const playExplosion = useCallback(() => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const t = ctx.currentTime;

    // 1. 서브 베이스 킥 생성
    const kickOsc = ctx.createOscillator();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(150, t);
    kickOsc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5); // 베이스 피치 하강 감쇄

    const kickGain = ctx.createGain();
    kickGain.gain.setValueAtTime(1.0, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    kickOsc.connect(kickGain);
    kickGain.connect(ctx.destination);

    // 2. 파열 노이즈 생성
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
       noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.1));
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    
    // 하이패스 필터 저음 제거
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    kickOsc.start(t);
    kickOsc.stop(t + 0.5);
    noiseSrc.start(t);

  }, [initAudio]);

  return { triggerSound, playExplosion };
};