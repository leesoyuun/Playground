import { lazy } from 'react';
import { MessageCircle, StickyNote, Timer } from 'lucide-react';

// Register an experiment here to add its home icon and independent route.
export const experiments = [
  { id: 'chat', title: '채팅', english: 'Chat lab', description: '대화의 새로운 방식을 실험해보세요.', icon: MessageCircle, color: 'blue', position: { left: '26%', top: '38%' }, component: lazy(() => import('./features/chat/ChatPage')) },
  { id: 'notes', title: '메모', english: 'Note lab', description: '생각을 담는 작은 인터페이스.', icon: StickyNote, color: 'yellow', position: { left: '70%', top: '31%' }, component: lazy(() => import('./features/notes/NotesPage')) },
  { id: 'timer', title: '타이머', english: 'Timer lab', description: '시간과 인터랙션을 가지고 놀아요.', icon: Timer, color: 'coral', position: { left: '57%', top: '66%' }, component: lazy(() => import('./features/timer/TimerPage')) },
];
