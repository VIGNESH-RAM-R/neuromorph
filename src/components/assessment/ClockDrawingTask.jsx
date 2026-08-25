import { useState, useRef } from 'react';
import { CLOCK_TARGET_TIME } from '../../config/clockDrawingConfig.js';
import { ClockDrawingEngine } from '../../engines/ClockDrawingEngine.js';

function angleFromClick(e, containerEl) {
  const rect = containerEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  const deg = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  return deg;
}

const TICKS = Array.from({ length: 12 }, (_, i) => i);

export default function ClockDrawingTask({ onSubmit }) {
  const [step, setStep] = useState('hour'); // 'hour' | 'minute'
  const [hourAngle, setHourAngle] = useState(null);
  const faceRef = useRef(null);

  function handleFaceClick(e) {
    const angle = angleFromClick(e, faceRef.current);
    if (step === 'hour') {
      setHourAngle(angle);
      setStep('minute');
    } else {
      const raw = ClockDrawingEngine.score({ hourAngle, minuteAngle: angle });
      onSubmit({ score: raw.score, raw });
    }
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">
        Set the clock to <strong>{CLOCK_TARGET_TIME.hour}:{String(CLOCK_TARGET_TIME.minute).padStart(2, '0')}</strong>.
        Tap where the {step === 'hour' ? 'short HOUR hand' : 'long MINUTE hand'} should point.
      </p>

      <div className="nmpa-clock__face" ref={faceRef} onClick={handleFaceClick}>
        {TICKS.map((i) => (
          <span key={i} className="nmpa-clock__tick" style={{ transform: `rotate(${i * 30}deg) translateY(-46%)` }}>{i === 0 ? 12 : i}</span>
        ))}
        {hourAngle !== null && (
          <div className="nmpa-clock__hand nmpa-clock__hand--hour" style={{ transform: `rotate(${hourAngle}deg)` }} />
        )}
        <div className="nmpa-clock__center" />
      </div>
    </div>
  );
}
