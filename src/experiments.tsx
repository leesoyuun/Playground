import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface Experiment {
  id: string;
  title: string;
  english: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'yellow' | 'coral';
  component: LazyExoticComponent<ComponentType>;
}

import { MessageCircle, StickyNote, Timer } from 'lucide-react';

// Register an experiment here to add its collection card and independent route.
export const experiments: Experiment[] = [
  { id: 'chat', title: '채팅', english: 'Chat lab', description: '메시지 누적과 스크롤 성능을 확인해보세요.', icon: MessageCircle, color: 'blue', component: lazy(() => import('./features/chat/ChatPage')) },
  { id: 'notes', title: '메모', english: 'Note lab', description: '생각을 담는 작은 인터페이스.', icon: StickyNote, color: 'yellow', component: lazy(() => import('./features/notes/NotesPage')) },
  { id: 'timer', title: '타이머', english: 'Timer lab', description: '시간과 인터랙션을 가지고 놀아요.', icon: Timer, color: 'coral', component: lazy(() => import('./features/timer/TimerPage')) },
];
