// Adapted rfice ChatItem / private/components/Message: app services -> local adapters.
// Keep memo(forwardRef), per-item user/message subscriptions, reply renderer,
// author grouping, nested ChatRenderer, reaction list, and hover action subtree.
import { forwardRef, memo, useState } from 'react';
import { Bookmark, MoreHorizontal, Reply, Smile, X } from 'lucide-react';
import styled from '@emotion/styled';
import { useMockChat } from '../mock/ChatProvider';
import { useMessageStore, useMockUser } from '../mock/store';
import { emitChatEvent, useChatEvent } from './interaction';
import ChatRenderer from './ChatRenderer';
import type { MessageData, User } from './types';
import { Column } from './primitives';

type Props = Omit<MessageData, 'content'> & { content: ChatServices.Format2.Message; isMe: boolean; isMessageGroup: boolean; variant: ChatUI.Size; lastMessageReadUsers?: User[] };
const ChatItem = forwardRef<HTMLLIElement, Props>(({ content, isMessageGroup, variant, ...message }, ref) => {
  const { actions } = useMockChat();
  const [menu, setMenu] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const user = useMockUser(message.user.id);
  // These subscriptions are intentionally kept even with an empty mock pending queue.
  useMessageStore(state => state.messages);
  useMessageStore(state => message.clientMessageId ? state.messages[message.clientMessageId]?.status : undefined);
  useChatEvent(event => { if (event.type === 'edit' && event.id !== message.roomMessageId) setEditing(false); });
  const original = () => ({ ...message, content: JSON.stringify(content) });
  return <ChatWrapper ref={ref} id={message.roomMessageId} data-message-id={message.roomMessageId} data-variant={variant}>
    <Blur className={message.emergency ? 'rf-emergency' : ''}>
      {!isMessageGroup && <div className="rf-user"><span className="rf-avatar" style={{ background: user?.colorProfile }}>{user?.name.slice(0, 1)}</span><strong>{user?.name}</strong><time>{new Date(message.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</time></div>}
      {message.replyMessage && !message.deleted && <div className="rf-reply"><strong>{message.replyMessage.user.name}에게 답장</strong><ChatRenderer chatForm={JSON.parse(message.replyMessage.content)} /></div>}
      <MessageBody>
        {message.deleted ? <span className="rf-deleted">삭제된 메시지입니다.</span> : editing ? <form className="rf-edit" onSubmit={event => { event.preventDefault(); if (draft.trim()) { actions.update(message.roomMessageId, draft); setEditing(false); } }}><textarea aria-label="메시지 수정 내용" value={draft} onChange={event => setDraft(event.target.value)} autoFocus maxLength={2000} /><button type="button" onClick={() => setEditing(false)}>취소</button><button disabled={!draft.trim()}>저장</button></form> : <>
          <ChatRenderer chatForm={content} files={message.files} emergency={message.emergency} isMe={message.isMe} />
          {message.messageUpdated && <small className="rf-edited">(수정됨)</small>}
          <div className="rf-hover-actions"><button aria-label="이모티콘 반응" title="이모티콘 반응" onClick={() => { setEmoji(!emoji); setMenu(false); }}><Smile size={15} /></button><button aria-label="답장하기" title="답장하기" onClick={() => emitChatEvent({ type: 'reply', message: original() })}><Reply size={15} /></button><button aria-label="즐겨찾기" aria-pressed={bookmarked} title="즐겨찾기" onClick={() => setBookmarked(!bookmarked)}><Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} /></button><button aria-label="메시지 메뉴" title="메시지 메뉴" onClick={() => { setMenu(!menu); setEmoji(false); }}><MoreHorizontal size={16} /></button></div>
        </>}
        {emoji && !message.deleted && <div className="rf-inline-menu">{['👍', '😊', '❤️', '🔥', '😢'].map(value => <button key={value} aria-label={`${value} 반응`} onClick={() => { actions.react(message.roomMessageId, value); setEmoji(false); }}>{value}</button>)}<button aria-label="반응 닫기" onClick={() => setEmoji(false)}><X size={14} /></button></div>}
        {menu && !message.deleted && <div className="rf-inline-menu"><button onClick={() => { emitChatEvent({ type: 'reply', message: original() }); setMenu(false); }}>답장하기</button>{message.isMe && <><button onClick={() => { emitChatEvent({ type: 'edit', id: message.roomMessageId }); setEditing(true); setDraft(content.elements.filter(item => item.type === 'text').map(item => item.text).join('\n')); setMenu(false); }}>수정하기</button><button onClick={() => { actions.remove(message.roomMessageId); setMenu(false); }}>삭제하기</button></>}<button aria-label="메뉴 닫기" onClick={() => setMenu(false)}><X size={14} /></button></div>}
      </MessageBody>
      {!message.deleted && message.reactions.length > 0 && <div className="rf-reactions">{message.reactions.map(reaction => <button key={reaction.type} aria-label={`${reaction.type} 반응`} aria-pressed={reaction.users.some(item => item.id === 'me')} title={reaction.users.map(item => item.name).join(', ')} onClick={() => actions.react(message.roomMessageId, reaction.type)}>{reaction.type} {reaction.count}</button>)}</div>}
      {message.lastMessageReadUsers && <div className="rf-readers">{message.lastMessageReadUsers.map(reader => reader.name).join(', ')} 읽음</div>}
    </Blur>
  </ChatWrapper>;
});
// The original DOM/style wrappers are retained on the full-size path.
const ChatWrapper = styled(Column.withComponent('li'))`border-radius:12px;width:-webkit-fill-available;`;
const Blur = styled(Column)`width:100%;height:100%;padding:0 16px 4px;border-radius:12px;`;
const MessageBody = styled(Column)`width:-webkit-fill-available;position:relative;margin-left:38px;padding:1px 4px;border-radius:4px;&:hover{background:#63668014;display:inline-flex;}.rf-hover-actions{display:none;}&:hover .rf-hover-actions,&:focus-within .rf-hover-actions{display:flex;}`;
const result = memo(ChatItem);
result.displayName = 'ChatItem';
export default result;
