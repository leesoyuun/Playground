import { useState } from 'react';
import { Check, StickyNote } from 'lucide-react';
export default function NotesPage() {
  const [text, setText] = useState(() => { try { return localStorage.getItem('playground-note') || ''; } catch { return ''; } });
  const [status, setStatus] = useState('이 브라우저에 자동 저장');
  function update(value: string) { setText(value); try { localStorage.setItem('playground-note', value); setStatus('저장됨'); } catch { setStatus('브라우저 저장 공간을 사용할 수 없어요'); } }
  return <section className="note-panel"><div className="panel-header"><span><StickyNote size={17} /> 자유로운 메모</span><span className="note-status"><Check size={13} />{status}</span></div><textarea aria-label="메모 내용" value={text} onChange={e => update(e.target.value)} placeholder={'어떤 기능을 만들어볼까요?\n\n아이디어, 체크리스트, 생각의 조각들을 남겨보세요.'} /><div className="note-count">{text.length.toLocaleString()}자</div></section>;
}
