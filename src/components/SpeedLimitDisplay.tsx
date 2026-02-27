import { useEffect, useRef, useState } from 'react';
import { Ets2Navigation, Ets2Truck } from '../types/telemetry';

interface SpeedLimitDisplayProps {
  navigation: Ets2Navigation;
  truck: Ets2Truck;
}

export function SpeedLimitDisplay({ navigation, truck }: SpeedLimitDisplayProps) {
  const currentSpeed = Math.round(truck.speed);
  const speedLimit = navigation.speedLimit;
  const isOverSpeed = speedLimit > 0 && currentSpeed > speedLimit;
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio queue system
  const audioQueueRef = useRef<number[]>([]);
  const isPlayingRef = useRef(false);

  const unlockSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    // Play a silent buffer to unlock audio on browsers that require user interaction
    const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start(0);
    setSoundUnlocked(true);
  };

  const playWarningSound = () => {
    const audio = new Audio('/audio/over_speed_limit.ogg');
    console.log('Playing warning sound');
    audio.play().catch((e) => {console.error('Error playing sound:', e)});
  };

  const playAudio = (sourceFile: string): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(sourceFile);
      audio.onended = () => resolve();
      audio.onerror = () => {
        console.warn('Audio file not found or error:', sourceFile);
        resolve(); // resolve anyway to keep queue moving
      };
      audio.play().catch(() => resolve());
    });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const processQueue = async () => {
    if (isPlayingRef.current) return;
    if (audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const limit = audioQueueRef.current.shift()!;
      console.log(`[AudioQueue] Playing sequence for speed limit: ${limit}`);
      try {
        await playAudio('/audio/ding.ogg');
        await playAudio('/audio/the_speed_limit_has_changed_to.ogg');
        await delay(300);
        await playAudio(`/audio/speedLimit/${Math.abs(limit)}kmh.ogg`);
      } catch (e) {
        console.error('[AudioQueue] Error in sequence:', e);
      }
    }

    isPlayingRef.current = false;
  };

  useEffect(() => {
    console.log('Speed limit changed:', speedLimit);
    if (speedLimit <= 0) return;

    // Enqueue the new speed limit value
    audioQueueRef.current.push(speedLimit);
    processQueue();
  }, [speedLimit]);



  const overspeedActive =
  speedLimit > 0 && currentSpeed > speedLimit + 5;

  useEffect(() => {
    if (!overspeedActive) return;

    playWarningSound(); // play ngay khi vượt quá 5km/h

    const interval = setInterval(() => {
      playWarningSound();
    }, 60000);

    return () => clearInterval(interval);
  }, [overspeedActive]);
    
  
  return (
    <div className={`bg-dashboard-card border rounded-xl p-6 space-y-4 ${overspeedActive ? 'animate-blink animate-[blink_1s_infinite_ease-in-out]' : ''}`}>
      
      <div className="flex items-center justify-center gap-8">
        {/* Speed Limit Sign */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-30 h-30 rounded-full border-12 border-red-500 bg-white flex items-center justify-center shadow-lg">
            {speedLimit > 0 ? (
              <span className="text-5xl font-black text-black leading-none font-BebasNeue_Regular">
          {Math.abs(speedLimit)}
              </span>
            ) : (
              <span className="text-xl font-black text-gray-400 leading-none">
          --
              </span>
            )}
          </div>
        </div>

        {/* Current Speed */}
        <div className="flex flex-col items-center gap-2">
          <div className={`w-30 h-30 rounded-full border-6 flex flex-col items-center justify-center transition-all duration-300 ${
            isOverSpeed
              ? ' border-red-600'
              : ' border-violet-900'
          }`}>
            <span className={`text-4xl font-black leading-none font-BebasNeue_Regular ${
              isOverSpeed ? 'text-slate-200' : 'text-slate-200'
            }`}>
              {currentSpeed}
            </span>
            <span className={`text-xs tracking-widest mt-1 ${
              isOverSpeed ? 'text-slate-400' : 'text-slate-400'
            }`}>
              km/h
            </span>
          </div>
        </div>
      </div>

      {/* Sound Unlock Button */}
      <div className="flex justify-center">
        <button
          onClick={unlockSound}
          className={`px-4 py-1.5 text-xs font-mono tracking-wider rounded-lg border transition-all duration-300 ${
            soundUnlocked
              ? 'border-green-600 text-green-500 bg-green-950 cursor-default hidden'
              : 'border-yellow-600 text-yellow-400 bg-yellow-950 hover:bg-yellow-900 cursor-pointer'
          }`}
          disabled={soundUnlocked}
        >
          {soundUnlocked ? 'SOUND UNLOCKED' : 'UNLOCK SOUND'}
        </button>
      </div>

    </div>
  );
}