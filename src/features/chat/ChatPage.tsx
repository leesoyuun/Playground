import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, MessageCircle, RotateCcw, SlidersHorizontal } from 'lucide-react';
type ReplyMode = 'echo' | 'fixed';
interface Message { id: string; role: 'user' | 'assistant'; text: string }
const initial: Message[] = [{ id: 'welcome', role: 'assistant', text: '안녕하세요! 여기는 채팅 실험실이에요. 메시지를 보내며 대화 UI를 테스트해보세요.' }];
export default function ChatPage() {
  const [messages, setMessages] = useState(initial);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ReplyMode>('echo');
  const [compact, setCompact] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const text = input.trim(); if (!text) return;
    const reply = mode === 'echo' ? `보내주신 메시지: ${text}` : '메시지를 받았어요. 이 응답을 원하는 로직으로 바꿔보세요!';
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', text }, { id: crypto.randomUUID(), role: 'assistant', text: reply }]); setInput('');
  }
  return <div className="experiment-workspace"><section className="chat-panel"><div className="panel-header"><span><MessageCircle size={17} /> 대화 미리보기 <i className="green-dot" /></span><button className="icon-button" aria-label="대화 초기화" title="대화 초기화" onClick={() => setMessages(initial)}><RotateCcw size={16} /></button></div><div className={`chat-messages ${compact ? 'compact' : ''}`} role="log" aria-live="polite">{messages.map(message => <div className={`chat-message ${message.role}`} key={message.id}><span className="message-author">{message.role === 'user' ? 'YOU' : 'PLAYGROUND BOT'}</span><div>{message.text}</div></div>)}<div ref={bottom} /></div><form onSubmit={send} className="composer"><input aria-label="메시지" placeholder="메시지를 입력해보세요…" value={input} onChange={e => setInput(e.target.value)} maxLength={2000} /><button aria-label="메시지 전송" disabled={!input.trim()}><ArrowUp size={19} /></button></form><p className="panel-footnote">로컬 데모 · 메시지는 서버로 전송되지 않아요</p></section><aside className="settings-panel"><h2><SlidersHorizontal size={16} /> 실험 설정</h2><label htmlFor="reply-mode">응답 방식</label><select id="reply-mode" value={mode} onChange={e => setMode(e.target.value === 'fixed' ? 'fixed' : 'echo')}><option value="echo">에코 — 입력한 메시지 되돌려주기</option><option value="fixed">고정 데모 응답</option></select><label className="checkbox-label"><input type="checkbox" checked={compact} onChange={e => setCompact(e.target.checked)} /> 메시지 간격 줄이기</label><div className="setting-info"><span>현재 대화</span><strong>{messages.filter(m => m.role === 'user').length}개의 메시지</strong></div><p className="settings-hint">응답 방식과 UI를 바꿔가며 채팅의 기본 동작을 실험해보세요.</p></aside></div>;
}
