import React, { useEffect, useState } from 'react';

const sunFrames = [
  '/bushes/S1.png', '/bushes/S2.png', '/bushes/S3.png', '/bushes/S4.png', '/bushes/S5.png', '/bushes/S6.png', '/bushes/S7.png', '/bushes/S8.png', '/bushes/S9.png', '/bushes/S10.png', '/bushes/S11.png',
];
const frameCount = sunFrames.length;
const frameRate = 600; // ms per frame (slower)

const STAGE = {
  ENTER: 'enter',
  INDUCTION: 'induction',
  START: 'start',
  TO_CORNER: 'toCorner',
  CORNER: 'corner',
} as const;
type Stage = typeof STAGE[keyof typeof STAGE];

const inductionText = "Hello, little explorer! Learning is like going on an adventure. Every time you open a book, listen to a story, or try something new, you grow your brain and discover exciting things. Today is a great day to start learning and have fun while doing it!";
const startText = "Start";

function useTypingEffect(text: string, active: boolean, speed: number = 40, onDone?: () => void) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed, onDone]);
  return displayed;
}

const SpeakingSun: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const [stage, setStage] = useState<Stage>(STAGE.ENTER);
  const [showInduction, setShowInduction] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [inductionDone, setInductionDone] = useState(false);
  const [startDone, setStartDone] = useState(false);

  // 1. Enter from top
  useEffect(() => {
    if (stage === STAGE.ENTER) {
      const timer = setTimeout(() => {
        setStage(STAGE.INDUCTION);
        setShowInduction(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // 2. Induction: animate talking and show memory/info
  useEffect(() => {
    if (stage !== STAGE.INDUCTION) return;
    const interval = setInterval(() => {
      setFrame((prev) => {
        const next = prev + 1;
        if (next === frameCount) {
          return prev;
        }
        return next;
      });
    }, frameRate);
    return () => clearInterval(interval);
  }, [stage]);

  // When induction typing is done, show Start
  useEffect(() => {
    if (inductionDone && stage === STAGE.INDUCTION) {
      setShowInduction(false);
      setShowStart(true);
      setStage(STAGE.START);
    }
  }, [inductionDone, stage]);

  // When Start typing is done, move to corner
  useEffect(() => {
    if (startDone && stage === STAGE.START) {
      // Wait 1.5s, then move to corner and keep 'Start' visible
      const timer = setTimeout(() => {
        setStage(STAGE.TO_CORNER);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [startDone, stage]);

  // Move to corner and keep 'Start' visible for 1.5s, then hide
  useEffect(() => {
    if (stage === STAGE.TO_CORNER) {
      const timer = setTimeout(() => {
        setShowStart(false);
        setStage(STAGE.CORNER);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Typing effects
  const inductionTyped = useTypingEffect(inductionText, showInduction, 50, () => setInductionDone(true));
  const startTyped = useTypingEffect(startText, showStart, 100, () => setStartDone(true));

  // Position logic
  let sunStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 30,
    transition: 'all 2s cubic-bezier(0.4,0,0.2,1)',
  };
  if (stage === STAGE.ENTER) {
    sunStyle = {
      ...sunStyle,
      top: '-8rem',
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: 0,
    };
  } else if (stage === STAGE.INDUCTION || stage === STAGE.START) {
    sunStyle = {
      ...sunStyle,
      top: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: 1,
    };
  } else if (stage === STAGE.TO_CORNER || stage === STAGE.CORNER) {
    sunStyle = {
      ...sunStyle,
      top: '1.5rem',
      right: '1.5rem',
      left: undefined,
      bottom: undefined,
      transform: 'none',
      opacity: 1,
    };
  }

  return (
    <div style={sunStyle}>
      <img
        src={sunFrames[Math.min(frame, frameCount - 1)]}
        alt="Animated Sun"
        className="w-40 h-40"
        draggable={false}
      />
      {/* Induction and Start containers, both visible until sun is in the corner */}
      {(showInduction || showStart) && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 flex flex-col gap-2 max-w-md min-w-[180px]">
          {showInduction && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-2xl px-6 py-2 shadow text-base font-semibold text-yellow-900 break-words whitespace-normal min-h-[90px] max-w-md text-wrap">
              {inductionTyped}
            </div>
          )}
          {showStart && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-2xl px-6 py-2 shadow text-lg font-bold text-yellow-900 break-words whitespace-normal max-w-md text-wrap">
              {startTyped}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeakingSun;