// Compatibility boundary for the original MessageList component.
// No REST/STOMP connections are opened. Mock cache mutations emit the same relevant events.
import { useEffect, type ReactNode } from 'react';
import { create } from 'zustand';
import styled from '@emotion/styled';
import type { User, MessageData } from '../rfice/types';
import { ROOM_ID, users } from './data';
export interface MockEvent { type: string; payload: unknown }
const subscribers = new Set<(event: MockEvent) => void>();
export const emitMockEvent = (event: MockEvent) => subscribers.forEach(callback => callback(event));
export function useStompClient(handlers: { onMessageReceived: (event: MockEvent) => void }, dependencies: React.DependencyList) {
  useEffect(() => { subscribers.add(handlers.onMessageReceived); return () => { subscribers.delete(handlers.onMessageReceived); }; }, dependencies);
}
export const useEventHandlers = (_handlers: { onNetworkSubscribing: () => void }, _dependencies: React.DependencyList) => {};
export const useMiniChatPopupManager = () => ({ miniChatPopupActions: { getCurrentFocus: () => ({ id: ROOM_ID }), getAll: () => [ROOM_ID] } });
export const usePersistActions = () => ({ users: { get_user: async (id: string) => users.find(user => user.id === id) } });
interface UIState {
  chat_search_selected: string;
  chat_searching: Record<string, boolean>;
  add_room_ui: (id: string) => void;
  remove_room_ui: (id: string) => void;
  set_chat_searching: (id: string, value: boolean) => void;
}
export const useChatDataStore = create<UIState>(set => ({ chat_search_selected: '', chat_searching: {}, add_room_ui: () => {}, remove_room_ui: () => {}, set_chat_searching: (id, value) => set(state => ({ chat_searching: { ...state.chat_searching, [id]: value } })) }));
export function useMessageSearch(_options: { roomID: string; getNextPage: unknown; messageList: MessageData[]; onShowRecentMessage?: (message: MessageData) => void }) {
  return { isSearching: false, isSearchTarget: (_id: string) => false, onMessageRendered: (_id: string) => {} };
}
interface ReaderState { roomId: string; messageId: string; users: User[] }
export function useLastMessageReaderState(_roomID: string, _isDM: boolean, _fetched: boolean) { return { data: undefined as ReaderState | undefined }; }
export const useLastMessageReaderActions = () => ({ setLastMessageReader: (_roomID: string, _update: (previous: ReaderState | undefined) => ReaderState) => {} });
export function UnDraggable({ children }: { children: ReactNode }) { return <div className="rf-message-area">{children}</div>; }
export function ChatNotice({ notice }: { notice: WebServices.Chat.GetRoom.Data['notice']; channelID: string; variant: ChatUI.Size }) { return <div>{notice?.message}</div>; }
export function LottieLoader() { return <p className="rf-date">메시지를 불러오는 중…</p>; }
export function Spinner({ variant: _variant }: { variant: ChatUI.Size }) { return <p className="rf-date">메시지를 불러오는 중…</p>; }
export function ScrollButton({ arrow, newMessage, onClick }: { arrow: boolean; newMessage: boolean; onClick: () => void }) { return arrow || newMessage ? <button className="rf-scroll-bottom" aria-label={newMessage ? '새 메시지' : '최신 메시지'} onClick={onClick}>{newMessage ? '새 메시지' : '최신 메시지'} ↓</button> : null; }
export const Body = styled.section<{ variant: ChatUI.Size; verticalAlign: string; reverse: boolean }>`position:relative;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;`;
export const NoticeLayer = styled.div<{ variant: ChatUI.Size; gap: number }>`display:flex;flex-direction:column;gap:${({ gap }) => gap}px;`;
export const hoverScrollCss = () => `overflow:auto;flex:1;min-height:0;list-style:none;margin:0;padding:0;`;
