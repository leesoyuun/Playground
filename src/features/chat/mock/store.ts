import { create } from 'zustand';
import { users } from './data';
import type { MessageData, User } from '../rfice/types';
// Keep the local-message/user subscriptions that exist in rfice's item tree.
export const useMessageStore = create<{ messages: Record<string, MessageData & { status: string }> }>(() => ({ messages: {} }));
const useUsers = create<{ users: Record<string, User> }>(() => ({ users: Object.fromEntries(users.map(user => [user.id, user])) }));
export const useMockUser = (id: string) => useUsers(state => state.users[id]);
