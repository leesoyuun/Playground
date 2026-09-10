import { useEffect } from 'react';
import type { MessageData } from './types';
type Event = { type: 'reply'; message: MessageData } | { type: 'edit'; id: string };
const listeners = new Set<(event: Event) => void>();
export const emitChatEvent = (event: Event) => listeners.forEach(listener => listener(event));
export function useChatEvent(listener: (event: Event) => void) {
  useEffect(() => { listeners.add(listener); return () => { listeners.delete(listener); }; }, [listener]);
}
