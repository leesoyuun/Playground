/**
 * @copyright (C) 2023, rsupport. All rights reserved
 *
 * @license
 * This software and/or source code may be used, copied and/or disseminated only
 * with the written permission of rsupport, or in accordance with the terms
 * and conditions stipulated in the agreement/contract under which the software
 * and/or source code has been supplied by rsupport or its affiliates.
 * Unauthorized use, copying, or dissemination of this file, via any medium, is
 * strictly prohibited, and will constitute an infringement of copyright.
 *
 * @author
 * SoonKi Min (skmin@rsupport.com)
 *
 * @description
 *
 * @created at Wed Oct 11 2023
 **/

import styled from "@emotion/styled";
import { useEffect, useMemo, useRef, useState } from "react";
import { debounce, isEmpty, isEqual } from "lodash-es";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import type { MessageList } from "./types";
import useMessageList from "./useMessageList";
import { Column } from "./primitives";
import Each from "./Each";
import Maybe from "./Maybe";
import useIntersectionObserver from "./useIntersectionObserver";
import { Configure, Utility } from "./utilities";
import Message from "./Message";
import useScrollButtonState from "./useScrollButtonState";
import useHasScroll from "./useHasScroll";
import { useMessageStore } from "../mock/store";
import type { MessageData as MessageType } from "./types";
import { useEventHandlers, hoverScrollCss, useStompClient, useMiniChatPopupManager, ChatNotice, LottieLoader, ScrollButton, Spinner, useChatDataStore, UnDraggable, usePersistActions, useLastMessageReaderActions, useLastMessageReaderState, useMessageSearch } from "../mock/services";
import * as S from "../mock/services";

type MessageListProps = {
	roomID: string;
	variant: ChatUI.Size;
	isMyRoom: boolean;
	myRoomID?: string;
	spaceID?: string;
	threadID?: string;
	notice?: WebServices.Chat.GetRoom.Data["notice"];
	voteNotice?: WebServices.Chat.GetRoom.Data["voteNotice"];
	blockedUsers?: string[];
	messageID?: string;
	onShowRecentMessage?: (message: MessageList[string]) => void;
	onShowMarkImage?: (isShow: boolean) => void;
	activityMessageID?: string;
};

const intersectionObserverOptions: IntersectionObserverInit = {
	threshold: [0, 0.25, 0.5, 0.75, 1]
};

export default function MessageList({
	roomID,
	spaceID,
	threadID: _threadID,
	variant,
	notice,
	onShowRecentMessage,
	activityMessageID,
	...rest
}: MessageListProps) {
	const { users } = usePersistActions();
	const shouldFetchNextPage = useRef(true);
	const shouldFetchPrevPage = useRef(true);
	const bodyRef = useRef<HTMLElement>(null);
	const firstInListNewMessage = useRef<HTMLLIElement | null>(null);
	const isUserTyping = useRef<boolean>(false);
	const hasPerformedInitialScroll = useRef(false);

	const [lastItem, setLastItem] = useState<MessageList[number] | null>(null);
	const [isFirstRender, setIsFirstRender] = useState(true);

	const { chatSearchTextId, addRoomUI, removeRoomUI, setIsSearch, isSearch } = useChatDataStore(
		useShallow((state) => ({
			chatSearchTextId: state.chat_search_selected,
			addRoomUI: state.add_room_ui,
			removeRoomUI: state.remove_room_ui,
			setIsSearch: state.set_chat_searching,
			isSearch: state.chat_searching[roomID] ?? false
		}))
	);

	const { joinStatus, messageList, status, getNextPage, formatMessage, refetchMessage, isFetchedAfterMount } =
		useMessageList();

	// local messages
	const messages = useMessageStore((state) => state.messages);
	// failed local messages
	const failedMessages = Object.values(messages).filter(
		(msg) => msg.status === "failed" && msg.threadMessageId === undefined && msg.roomId === roomID
	);
	// sort fetched messages by createdAt
	const sortedMessageList = Object.values(messageList).sort(
		(messageA, messageB) => messageA.createdAt - messageB.createdAt
	);
	// append failed local messages
	const messageListSortedByCreatedDate: MessageType[] = useMemo(
		() => [...sortedMessageList, ...failedMessages] as MessageType[],
		[sortedMessageList, failedMessages]
	);
	const lastMessageReaderState = useLastMessageReaderState(roomID, !spaceID, isFetchedAfterMount);
	const lastMessageReaderActions = useLastMessageReaderActions();

	const originLastItem = messageListSortedByCreatedDate[messageListSortedByCreatedDate.length - 1];
	const { ref: containerRef, hasScroll, isShowScrollDown } = useHasScroll();

	const { isSearching, isSearchTarget, onMessageRendered } = useMessageSearch({
		roomID,
		getNextPage,
		messageList: messageListSortedByCreatedDate,
		onShowRecentMessage
	});

	const { scrollButtonState, changeScrollButtonState } = useScrollButtonState();
	const isShowMessageNotice =
		notice && notice.noticeType === "GENERAL" && Utility.convert.stringToJSON(notice.message)?.type === "richtext";

	const { miniChatPopupActions } = useMiniChatPopupManager();
	const getCurrentFocus = miniChatPopupActions.getCurrentFocus();

	const queryClient = useQueryClient();

	const targetActivityMessageID = activityMessageID === "auto" ? undefined : activityMessageID;

	/**
	 * nextPage(이전 메세지)를 로드한 후 스크롤을 유지한다 - 스크롤 보정을 안하면 height가 바뀌면서 스크롤이 튄다
	 */
	const toPreviousScrollPosition = (previousPosition: { scrollHeight: number; scrollTop: number }) => {
		return new Promise((resolve) => {
			if (!containerRef.current) return;
			shouldFetchNextPage.current = false;

			const newScrollHeight = containerRef.current?.scrollHeight ?? 100;
			const heightDifference = newScrollHeight - previousPosition.scrollHeight;
			containerRef.current.scrollTop = previousPosition.scrollTop + heightDifference;

			shouldFetchNextPage.current = true;
			resolve(true);
		});
	};

	/**
	 * prevPage(이후 메세지)를 로드한 후 스크롤을 유지한다 - 스크롤 보정을 안하면 height가 바뀌면서 스크롤이 튄다
	 */
	const toNextScrollPosition = (previousPosition: { scrollHeight: number; scrollTop: number }) => {
		return new Promise((resolve) => {
			if (!containerRef.current) return;
			shouldFetchPrevPage.current = false;

			const newScrollHeight = containerRef.current?.scrollHeight ?? 100;
			const prevScrollTop = previousPosition.scrollTop;

			containerRef.current.scrollTop = prevScrollTop + (newScrollHeight - previousPosition.scrollHeight);

			shouldFetchPrevPage.current = true;
			resolve(true);
		});
	};

	/*
	 * 스크롤 상단으로 올라왔을 때 nextPage(이전 메세지) 로드한다
	 */
	const { observerRef: getNextPageRef } = useIntersectionObserver<HTMLLIElement>(
		debounce(async (node: IntersectionObserverEntry) => {
			if (chatSearchTextId) return;
			if (!containerRef.current || !getNextPageRef.current) return;
			if (!node.isIntersecting || status.isLoading || !status.hasNextPage) return;

			const previousScrollTop = containerRef.current.scrollTop;
			const previousScrollHeight = containerRef.current.scrollHeight;

			if (shouldFetchNextPage.current) {
				const firstMessageId = messageListSortedByCreatedDate[0]?.roomMessageId;
				await getNextPage({ pageParam: { id: firstMessageId, order: "DESC" } });
			}

			await toPreviousScrollPosition({
				scrollHeight: previousScrollHeight,
				scrollTop: previousScrollTop > 0 ? previousScrollTop : (getNextPageRef.current?.clientHeight ?? 0)
			});
		}, 500),
		[status.isLoading, status.hasNextPage, messageListSortedByCreatedDate.length, chatSearchTextId],
		{
			...intersectionObserverOptions,
			root: containerRef.current
		}
	);

	/**
	 * 스크롤 하단으로 내려왔을 때 prevPage(이후 메세지) 로드한다
	 */
	const { observerRef: getPrevPageRef } = useIntersectionObserver<HTMLLIElement>(
		debounce(async (node: IntersectionObserverEntry) => {
			if (chatSearchTextId) return;
			if (!containerRef.current || !getPrevPageRef.current) return;
			if (!node.isIntersecting || status.isLoading || !isSearch) return;

			const previousScrollTop = containerRef.current.scrollTop;
			const previousScrollHeight = containerRef.current.scrollHeight;

			if (shouldFetchPrevPage.current) {
				const lastMessageId = messageListSortedByCreatedDate.slice(-1)[0]?.roomMessageId;
				await getNextPage({ pageParam: { id: lastMessageId, order: "ASC" } });
			}

			await toNextScrollPosition({
				scrollHeight: previousScrollHeight,
				scrollTop: previousScrollTop > 0 ? previousScrollTop : (getPrevPageRef.current?.clientHeight ?? 0)
			});
		}, 500),
		[status.isLoading, status.hasNextPage, messageListSortedByCreatedDate.length, chatSearchTextId],
		{
			...intersectionObserverOptions,
			root: containerRef.current
		}
	);

	/**
	 * 마지막 메세지가 보였을 때 messageReaded 호출한다
	 */
	const { observerRef: lastChatRef, isShow: isShowLastChat } = useIntersectionObserver<HTMLLIElement>(
		(node) => {
			if (node.isIntersecting) {
				const lastMessage = Object.values(messageListSortedByCreatedDate).slice(-1)[0];
				onShowRecentMessage?.(lastMessage);
			}
		},
		[scrollButtonState.newMessage, messageListSortedByCreatedDate.length],
		{
			...intersectionObserverOptions,
			root: containerRef.current
		}
	);

	/* Scroll to Bottom on Open */
	useEffect(() => {
		hasPerformedInitialScroll.current = false;

		// activityMessageID 있을 경우 제외
		if (targetActivityMessageID) return;

		// 검색 중일 때 제외
		if (isSearching) return;
		if (!isFirstRender) return;

		// 메세지가 fetch되지 않은 경우 제외
		if (!containerRef.current || joinStatus !== "success") return;

		containerRef.current.scrollTop = containerRef.current.scrollHeight;
		hasPerformedInitialScroll.current = true;

		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const observer = new ResizeObserver(() => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				if (containerRef.current) {
					containerRef.current.scrollTop = containerRef.current.scrollHeight;
					hasPerformedInitialScroll.current = true;
					observer.disconnect();
				}
			}, 100);
		});

		observer.observe(containerRef.current);

		return () => {
			observer.disconnect();
			clearTimeout(timeoutId);
		};
	}, [roomID, joinStatus, targetActivityMessageID, isSearching, isFirstRender]);

	/* Top Button */
	// 리사이즈 옵저버 추가
	// 채팅 영역 사이즈가 줄어들때 isShowLastChat 조건에 따라 채팅 스크롤 처리
	// arrow 처리는 무조건 scroll 발생시 동작하는 코드기 떄문에 resize에서 처리함.
	useEffect(() => {
		bodyRef.current && observer.observe(bodyRef.current);
		return () => {
			bodyRef.current && observer.unobserve(bodyRef.current);
		};
	}, [isShowLastChat, scrollButtonState.newMessage, isShowScrollDown]);

	const observer = new ResizeObserver(() => {
		if (isShowLastChat) {
			changeScrollButtonState("clear");
		} else {
			if (!scrollButtonState.newMessage) {
				if (isShowScrollDown) changeScrollButtonState("arrow");
				else changeScrollButtonState("clear");
			}
		}
	});

	const scrollToBottom = () => {
		if (!containerRef.current) return;
		if (isSearch) {
			setIsSearch(roomID, false);
			setTimeout(() => {
				if (!targetActivityMessageID) formatMessage();
				lastChatRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
			}, 500);
		} else {
			lastChatRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
		}

		firstInListNewMessage.current = null;
	};

	/* Scroll on Writing */
	useEffect(() => {
		const shouldScroll = isUserAtBottom();

		//채팅을 두줄 이상 작성할 경우 스크롤이 맨 하단 요소 유지될 수 있도록 처리
		if (shouldScroll && containerRef.current && isUserTyping.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
			return;
		}
		if (isShowLastChat) {
			// UI가 스크롤 제일 하단에 위치하고 있고 마지막 요소의 데이터가 변경되었을때 스크롤링 처리 -- 다른 유저가 메세지를 변경하였을 때
			if (!isEqual(lastItem, originLastItem)) {
				if (lastItem) {
					lastChatRef.current?.scrollIntoView(false);
				}
				// setLastItem 하는 이유는 Equal 이 아니면 스크롤링이 계속 일어나기 때문
				setLastItem(originLastItem);
			}
		}
	}, [isShowLastChat, lastItem, messageListSortedByCreatedDate]);

	const isUserAtBottom = () => {
		const THRESHOLD = 30;
		const container = containerRef.current;
		if (!container) return false;

		return container.scrollHeight - container.scrollTop - container?.clientHeight < THRESHOLD;
	};

	/* Network */
	useEventHandlers(
		{
			onNetworkSubscribing() {
				checkOpenChatOnConnect();
			}
		},
		[]
	);

	const checkOpenChatOnConnect = () => {
		const openChatList = miniChatPopupActions.getAll();
		if (openChatList) {
			refetchMessage();
		}
	};

	/* Stomp */
	useStompClient(
		{
			onMessageReceived(msg) {
				switch (msg.type) {
					case "messageSent": {
						const payload = msg.payload as ChatServices.Server.MessageSent.Data;
						if (payload.roomId !== roomID) return;

						const isMe = payload.sender.id === Configure.userID;

						if (!isMe && !isShowLastChat) {
							// 새매세지 처리는 받는 곳 에서만
							changeScrollButtonState("newMessage");
						}
						break;
					}

					case "messageReacted": {
						const payload = msg.payload as ChatServices.Server.MessageReacted.Data;
						if (payload.reacted && isShowLastChat) {
							// 이모지 메세지를 받을때 마지막 메세지에 대한 정보를 저장 ( 스크롤 처리 위함 )
							setLastItem(originLastItem);
						}
						break;
					}

					case "typing": {
						const { type, id, roomID } = msg.payload as ChatServices.Server.Typing.Data;
						isUserTyping.current = type !== "end" && id === Configure.userID && roomID === roomID;
						break;
					}

					case "messageReadToRoom": {
						const payload = msg.payload as ChatServices.Server.MessageReadToRoom.Data;
						if (payload.memberId === Configure.userID) return;
						if (payload.roomId !== roomID) return;

						// 비동기 처리를 위한 헬퍼 함수
						const _updateLastMessageReader = async () => {
							const user = await users.get_user(payload.memberId);
							if (!user || !user.name) return; // name이 필수이므로 체크

							const userProfile: WebServices.DirectMessage.GetReaders.Data["users"][number] = {
								id: payload.memberId,
								name: user.name, // 위에서 체크했으므로 string 보장
								profileImagePath: user.profileImagePath,
								colorProfile: user.colorProfile,
								guest: false
							};

							lastMessageReaderActions.setLastMessageReader(roomID, (prev) => {
								if (!prev) {
									// 이전 데이터가 없으면 새로 생성
									return {
										roomId: roomID,
										messageId: payload.messageId,
										users: [userProfile]
									};
								}

								if (payload.messageId === prev.messageId) {
									// 같은 메시지에 대한 읽음 처리 - 기존 users 배열에 추가/업데이트
									const existingUserIndex = prev.users.findIndex((u) => u.id === payload.memberId);

									if (existingUserIndex >= 0) {
										// 이미 존재하는 사용자 업데이트
										const updatedUsers = [...prev.users];
										updatedUsers[existingUserIndex] = userProfile;
										return {
											...prev,
											users: updatedUsers
										};
									} else {
										// 새 사용자 추가
										return {
											...prev,
											users: [...prev.users, userProfile]
										};
									}
								} else {
									// 다른 메시지에 대한 읽음 처리 - 새로 시작
									return {
										roomId: roomID,
										messageId: payload.messageId,
										users: [userProfile]
									};
								}
							});
						};

						_updateLastMessageReader().catch(console.error);
						break;
					}
				}
			}
		},
		[isShowLastChat, messageListSortedByCreatedDate]
	);

	/* Room */
	useEffect(() => {
		addRoomUI(roomID);
		return () => {
			removeRoomUI(roomID);
		};
	}, [roomID]);

	/* Search */
	useEffect(() => {
		return () => {
			// 진행중인 fetch가 있다면 abort
			if (targetActivityMessageID && !isSearching) queryClient.cancelQueries(["useMessageList", roomID]);
		};
	}, [roomID, activityMessageID]);

	// target activity message ID가 있는데, fetching 중이거나 아직 준비가 안됐으면 spinner 노출
	const isFetchingMessage = status.fetchStatus === "fetching" || isSearching;
	const showActivitySpinner = roomID === getCurrentFocus?.id && targetActivityMessageID && isFetchingMessage;

	return (
		<UnDraggable>
			<S.Body variant={variant} verticalAlign="bottom" reverse={variant === "transparent"} ref={bodyRef}>
				<Maybe test={joinStatus !== "loading"} fallback={<LottieLoader />}>
					<S.NoticeLayer variant={variant} gap={2}>
						<Maybe test={isShowMessageNotice}>
							<ChatNotice notice={notice} channelID={roomID} variant={variant} />
						</Maybe>
					</S.NoticeLayer>

					{/* Fetching loader */}
					{showActivitySpinner && <Spinner variant={variant} />}

					<StyledList
                        role="log" aria-label="메시지 목록" aria-live="off" data-testid="rfice-message-list" data-loaded-count={messageListSortedByCreatedDate.length}
						ref={containerRef}
						hasScroll={hasScroll}
						variant={variant}
						gap={variant === "transparent" ? 4 : 0}
					>
						<Each
							useArray
							of={messageListSortedByCreatedDate}
							render={(message, index) => {
								const prevMessage = index > 0 ? messageListSortedByCreatedDate[index - 1] : null;
								const isLastChat = index === messageListSortedByCreatedDate.length - 1;

								const isLastChatRef = isSearch ? getPrevPageRef : lastChatRef;
								const isFirstChat = index === 0;

								const ref = isLastChat ? isLastChatRef : isFirstChat ? getNextPageRef : null;
								return (
									<Message
										lastMessageReadUsers={
											lastMessageReaderState.data?.messageId === message.roomMessageId &&
											lastMessageReaderState.data.users
												? lastMessageReaderState.data.users
												: undefined
										}
										ref={ref}
										key={message.roomMessageId.length > 0 ? message.roomMessageId : `msg-${index}`}
										index={index}
										message={message}
										previousMessage={prevMessage}
										isMyRoom={rest.isMyRoom}
										myRoomID={rest.myRoomID}
										spaceID={spaceID}
										variant={variant}
										thread={message.thread}
										isLastChat={isLastChat}
										isShowLastChat={isShowLastChat}
										isFirstRender={isFirstRender}
										hasNextPage={status.hasNextPage ?? false}
										onMount={() => {
											setIsFirstRender(false);
										}}
										onUnMount={() => {
											setIsFirstRender(true);
										}}
										isSearchTarget={isSearchTarget(message.roomMessageId)}
										onRendered={() => onMessageRendered(message.roomMessageId)}
										highlightOnLoad={activityMessageID === "auto"}
									/>
								);
							}}
						/>
					</StyledList>

					<Maybe test={!isEmpty(messageListSortedByCreatedDate)}>
						<ScrollButton {...scrollButtonState} onClick={() => scrollToBottom()} />
					</Maybe>
				</Maybe>
			</S.Body>
		</UnDraggable>
	);
}

const StyledList = styled(Column.withComponent("ul"))<{ hasScroll: boolean; variant: ChatUI.Size }>`
	${hoverScrollCss()};
	scrollbar-gutter: ${({ variant }) => (variant === "transparent" ? "stable" : "auto")};
	width: 100%;
	padding-top: 16px;
	clip-path: inset(0 0 0 0);
`;
