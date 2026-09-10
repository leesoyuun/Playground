import type { DatasetKind, MessageData, MessagePage, PageParam, User } from '../rfice/types';
export const ROOM_ID = 'rfice-performance-room';
export const PAGE_SIZE = 40;
export const users: User[] = [
  { id: 'me', name: '나', colorProfile: '#c8c7ed' },
  { id: 'minji', name: '민지', colorProfile: '#d8e8d4' },
  { id: 'junho', name: '준호', colorProfile: '#f6dfc2' },
  { id: 'seoyeon', name: '서연', colorProfile: '#d1e5f0' },
  { id: 'jiho', name: '지호', colorProfile: '#efd5de' },
];
const baseTime = new Date('2026-09-01T09:00:00+09:00').getTime();
const sentences = ['오늘 진행한 작업 공유드려요. 확인 후 편하게 의견 남겨주세요.', '메시지가 쌓인 상태에서 스크롤과 입력 반응을 확인하고 있어요.', '좋아요! 이 방향으로 진행해볼게요 😊', '화면 크기를 바꾸어도 대화 위치가 유지되는지 확인해주세요.', '짧은 메시지와 긴 메시지를 섞어서 실제 대화에 가까운 데이터를 만들었습니다.\n줄바꿈이 포함된 메시지의 높이 변화도 함께 확인할 수 있어요.\n여기까지가 세 번째 줄입니다.'];
export function createMessage(index: number, kind: DatasetKind = 'mixed', mine = false, text?: string): MessageData {
  const user = mine ? users[0] : users[Math.floor(index / 3) % users.length];
  const elements: ChatServices.Format2.Elements.AllRichtextElements[] = [{ type: 'text', text: text ?? `[${String(index + 1).padStart(4, '0')}] ${sentences[index % sentences.length]}` }];
  const files: MessageData['files'] = [];
  if (kind === 'mixed' && text === undefined) {
    if (index % 11 === 0) elements.push({ type: 'section', elements: [{ type: 'user', id: users[1].id, name: users[1].name }, { type: 'text', text: ' 검토 부탁드려요. ', style: { bold: true } }, { type: 'text', text: '렌더링 테스트', style: { code: true } }] });
    if (index % 13 === 0) elements.push({ type: 'makeList', marker: 'ordered', elements: [{ type: 'text', text: '스크롤 위치 확인' }, { type: 'text', text: '메시지 입력 확인' }, { type: 'text', text: '이모지 반응 확인' }] });
    if (index % 17 === 0) elements.push({ type: 'codeBlock', code: 'const messages = await loadMessages();\nrender(messages);' });
    if (index % 19 === 0) elements.push({ type: 'blockquote', elements: [{ type: 'text', text: '이전 논의 내용을 인용한 샘플 메시지입니다.' }] });
    if (index % 23 === 0) files.push({ id: `image-${index}`, data: JSON.stringify({ type: 'image', id: `image-${index}`, url: `${import.meta.env.BASE_URL}chat-mock/preview.svg`, alt: '프로젝트 미리보기' }) });
    if (index % 29 === 0) files.push({ id: `file-${index}`, data: JSON.stringify({ type: 'file', id: `file-${index}`, title: '기획안.pdf', mime: 'application/pdf', size: 245760, displaySize: '240 KB', url: '' }) });
    if (index % 31 === 0) elements.push({ type: 'section', elements: [{ type: 'link', title: '문서 링크 샘플', url: 'https://example.com', info: { fileBoxId: '' } }] });
  }
  const content = JSON.stringify({ type: 'richtext', elements });
  return { roomId: ROOM_ID, roomMessageId: `message-${index + 1}`, user, content, createdAt: baseTime + index * 20000, deleted: false, emergency: kind === 'mixed' && index % 97 === 0, files,
    reactions: kind === 'mixed' && index % 7 === 0 ? [{ type: '👍', count: 1, users: [users[1]] }] : [],
    ...(kind === 'mixed' && index > 0 && index % 9 === 0 ? { replyMessage: { roomMessageId: `message-${index}`, user: users[1], content: JSON.stringify({ type: 'richtext', elements: [{ type: 'text', text: '이전 메시지에 대한 답장입니다.' }] }) } } : {}),
  };
}
export class MockChatServer {
  messages: MessageData[];
  constructor(public count = 2000, public kind: DatasetKind = 'mixed') { this.messages = Array.from({ length: count }, (_, index) => createMessage(index, kind)); }
  readonly requests: { cursorId?: string; order: 'DESC' | 'ASC'; responseSize: number }[] = [];
  async fetchMessages(param?: PageParam, signal?: AbortSignal): Promise<MessagePage> {
    // Async mock API boundary: only this page crosses into the query cache.
    await Promise.resolve();
    signal?.throwIfAborted();
    const result = structuredClone(this.page(param));
    this.requests.push({ cursorId: param?.id, order: param?.order ?? 'DESC', responseSize: result.content.length });
    return result;
  }
  private page(param?: PageParam): MessagePage {
    const index = param?.id ? this.messages.findIndex(item => item.roomMessageId === param.id) : this.messages.length;
    if (index < 0) throw new Error('존재하지 않는 메시지 커서입니다.');
    const cursor = index;
    const content = param?.order === 'ASC' ? this.messages.slice(cursor + 1, cursor + 1 + PAGE_SIZE) : this.messages.slice(Math.max(0, cursor - PAGE_SIZE), cursor).reverse();
    const hasMore = param?.order === 'ASC' ? cursor + 1 + content.length < this.messages.length : cursor - content.length > 0;
    return { content, nextPage: hasMore ? content.at(-1)?.roomMessageId : undefined };
  }
  append(mine = false, text?: string) {
    const next = createMessage(this.messages.length, this.kind, mine, text);
    next.clientMessageId = `mock-client-${next.roomMessageId}`;
    if (!mine && next.user.id === 'me') next.user = users[1];
    this.messages.push(next); return next;
  }
}
