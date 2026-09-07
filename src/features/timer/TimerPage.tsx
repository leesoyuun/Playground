import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
export default function TimerPage() {
  const [duration, setDuration] = useState(300);
  const [seconds, setSeconds] = useState(300);
  const [deadline, setDeadline] = useState<number | null>(null);
  useEffect(() => { if (deadline === null) return; const tick = () => { const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); setSeconds(remaining); if (!remaining) setDeadline(null); }; tick(); const interval = setInterval(tick, 200); return () => clearInterval(interval); }, [deadline]);
  function reset(value = duration) { setDeadline(null); setSeconds(value); setDuration(value); }
  return <section className="timer-panel"><span className="lab-eyebrow">ONE THING AT A TIME</span><h2>{seconds === 0 ? '실험 완료! 잠시 쉬어가세요.' : '작은 실험에 집중할 시간'}</h2><div className="timer-digits" role="timer">{String(Math.floor(seconds / 60)).padStart(2, '0')}<span>:</span>{String(seconds % 60).padStart(2, '0')}</div><div className="duration-options">{[5, 15, 25].map(min => <button key={min} className={duration === min * 60 ? 'selected' : ''} onClick={() => reset(min * 60)}>{min}분</button>)}</div><div className="timer-buttons"><button className="primary-button" onClick={() => { if (deadline) { setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))); setDeadline(null); } else { const next = seconds || duration; setSeconds(next); setDeadline(Date.now() + next * 1000); } }}>{deadline ? <Pause size={17} /> : <Play size={17} />}{deadline ? '일시정지' : '시작하기'}</button><button className="icon-button" onClick={() => reset()} aria-label="타이머 초기화"><RotateCcw size={19} /></button></div><p className="panel-footnote">이 페이지를 나가면 타이머가 초기화됩니다.</p></section>;
}
