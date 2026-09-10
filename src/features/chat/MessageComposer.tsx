import { useRef, useState, type FormEvent } from 'react';
import { Send, Smile, X } from 'lucide-react';
import { useMockChat } from './mock/ChatProvider';
import { useChatEvent } from './rfice/interaction';
import type { MessageData } from './rfice/types';
import ChatRenderer from './rfice/ChatRenderer';
export default function MessageComposer() {
  const { actions } = useMockChat();
  const [input, setInput] = useState('');
  const [reply, setReply] = useState<MessageData>();
  const [emoji, setEmoji] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  useChatEvent(event => { if (event.type === 'reply') { setReply(event.message); editor.current?.focus(); } });
  function send(event: FormEvent) {
    event.preventDefault(); if (!input.trim()) return;
    actions.send(input, reply); setInput(''); setReply(undefined); setEmoji(false); editor.current?.focus();
  }
  return <form className="rf-composer" onSubmit={send}>
    {reply && <div className="rf-composer-reply"><div><strong>{reply.user.name}에게 답장</strong><ChatRenderer chatForm={JSON.parse(reply.content)} maxLine={1} /></div><button type="button" aria-label="답장 취소" onClick={() => setReply(undefined)}><X size={16} /></button></div>}
    <textarea ref={editor} aria-label="메시지" placeholder="메시지를 입력하세요" value={input} onChange={event => setInput(event.target.value)} maxLength={2000} rows={2} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
    {emoji && <div className="rf-composer-emojis">{['😊', '👍', '❤️', '🎉'].map(value => <button key={value} type="button" onClick={() => { setInput(text => (text + value).slice(0, 2000)); setEmoji(false); editor.current?.focus(); }}>{value}</button>)}</div>}
    <div className="rf-composer-tools"><button type="button" aria-label="이모지 선택" aria-expanded={emoji} onClick={() => setEmoji(!emoji)}><Smile size={19} /></button><span>Enter 전송 · Shift + Enter 줄바꿈</span><button className="rf-send" aria-label="메시지 전송" disabled={!input.trim()}><Send size={17} /></button></div>
  </form>;
}
