import { forwardRef } from 'react';
import type { MessageData } from './types';
export function DateDescriptor({ timestamp1, timestamp2 }: { timestamp1: number; timestamp2: number; isFirstMessage: boolean; isCreate: boolean }) {
  if (new Date(timestamp1).toDateString() === new Date(timestamp2).toDateString()) return null;
  return <li className="rf-date">{new Date(timestamp1).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</li>;
}
export const System = forwardRef<HTMLLIElement, MessageData & { contents: ChatServices.Format2.Container.System; variant: ChatUI.Size }>((props, ref) => <li className="rf-date" ref={ref}>{props.user.name} · 시스템 메시지</li>);
