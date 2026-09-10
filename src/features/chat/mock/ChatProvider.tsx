import { emitMockEvent } from './services';
import produce from 'immer';
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query';
import { MockChatServer, ROOM_ID, users } from './data';
import type { DatasetKind, MessageData, MessagePage } from '../rfice/types';
export interface ChatActions {
  send: (text: string, reply?: MessageData) => void;
  receive: (count: number) => void;
  update: (id: string, text: string) => void;
  remove: (id: string) => void;
  react: (id: string, emoji: string) => void;
}
interface ContextValue { server: MockChatServer; actions: ChatActions }
const Context = createContext<ContextValue | null>(null);
export function useMockChat() { const value = useContext(Context); if (!value) throw new Error('Missing mock chat provider'); return value; }
const queryKey = ['useMessageList', ROOM_ID];
export function MockChatProvider({ children, count, kind }: { children: ReactNode; count: number; kind: DatasetKind }) {
  const session = useMemo(() => {
    const server = new MockChatServer(count, kind);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
    function mutate(transform: (message: MessageData) => MessageData) {
      server.messages = server.messages.map(transform);
      client.setQueryData<InfiniteData<MessagePage>>(queryKey, previous => produce(previous, draft => {
        draft?.pages.forEach(page => { page.content = page.content.map(transform); });
      }));
    }
    function append(mine: boolean, text?: string, reply?: MessageData) {
      const next = server.append(mine, text);
      if (reply) next.replyMessage = { roomMessageId: reply.roomMessageId, user: reply.user, content: reply.content };
      // Retain rfice useMessageListHandler.messageSent exactly on the non-thread path:
      // every cached page receives the same message; useMessageList deduplicates by ID.
      client.setQueryData<InfiniteData<MessagePage>>(queryKey, previous => produce(previous, draft => {
        draft?.pages.forEach(page => { page.content = [...page.content, next]; });
      }));
      emitMockEvent({ type: "messageSent", payload: { roomId: next.roomId, sender: next.user } });
    }
    const actions: ChatActions = {
      send: (text, reply) => { if (text.trim()) append(true, text.trim(), reply); },
      receive: amount => { for (let index = 0; index < amount; index++) append(false); },
      update: (id, text) => mutate(message => message.roomMessageId === id && message.user.id === 'me' ? { ...message, content: JSON.stringify({ type: 'richtext', elements: [{ type: 'text', text }] }), messageUpdated: true } : message),
      remove: id => mutate(message => message.roomMessageId === id && message.user.id === 'me' ? { ...message, deleted: true } : message),
      react: (id, emoji) => mutate(message => {
        if (message.roomMessageId !== id) return message;
        const target = message.reactions.find(reaction => reaction.type === emoji);
        const participating = target?.users.some(user => user.id === 'me');
        const nextUsers = participating ? target!.users.filter(user => user.id !== 'me') : [...(target?.users ?? []), users[0]];
        const others = message.reactions.filter(reaction => reaction.type !== emoji);
        return { ...message, reactions: nextUsers.length ? [...others, { type: emoji, count: nextUsers.length, users: nextUsers }] : others };
      }),
    };
    return { client, value: { server, actions } };
  }, [count, kind]);
  const disposal = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(disposal.current);
    // Delay disposal one task so React StrictMode's setup/cleanup/setup preserves the fixture.
    return () => { disposal.current = setTimeout(() => session.client.clear(), 0); };
  }, [session]);
  return <QueryClientProvider client={session.client}><Context.Provider value={session.value}>{children}</Context.Provider></QueryClientProvider>;
}
