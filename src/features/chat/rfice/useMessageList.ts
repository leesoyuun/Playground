// Extracted from rfice useMessageList: network/room lifecycle is replaced by MockChatServer.
// Preserve Query v4 infinite pages -> flatMap -> filter -> ID record and 40-item cursors.
import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { MessageData, MessageList, MessagePage, PageParam } from './types';
import { useMockChat } from '../mock/ChatProvider';
import { ROOM_ID } from '../mock/data';
export default function useMessageList() {
  const { server } = useMockChat();
  const { data, fetchNextPage, hasNextPage, ...status } = useInfiniteQuery<MessagePage>(['useMessageList', ROOM_ID], {
    queryFn: ({ pageParam, signal }) => server.fetchMessages(pageParam as PageParam | undefined, signal),
    refetchOnWindowFocus: false, refetchOnMount: false, refetchOnReconnect: false,
    getNextPageParam: lastPage => lastPage.nextPage ? { id: lastPage.nextPage, order: 'DESC' } : undefined,
  });
  const messageList = useMemo(() => data?.pages.flatMap(page => page.content).filter(content => content?.roomId === ROOM_ID).reduce((total, current) => {
    if (!current) return total;
    const uniqueId = current.clientMessageId;
    if (uniqueId) Object.keys(total).map(key => { const message = total[key]; if (message.roomMessageId === '' && message.clientMessageId === uniqueId) delete total[key]; });
    total[current.roomMessageId] = current;
    return total;
  }, {} as MessageList) ?? {}, [data]);
  return { messageList, status: { ...status, hasNextPage }, getNextPage: fetchNextPage, joinStatus: "success", formatMessage: status.remove, refetchMessage: status.refetch, isFetchedAfterMount: status.isFetchedAfterMount };
}
export type { MessageData };
