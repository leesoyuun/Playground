/**
 * @copyright (C) 2024, rsupport. All rights reserved
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
 * @created at Fri Apr 05 2024
 **/

import { forwardRef, Fragment, memo, useEffect } from "react";
import { debounce, isEmpty, isEqual } from "lodash-es";

import Maybe from "./Maybe";
import Choice from "./Choice";
import type { MessageList } from "./types";
import { Configure } from "./utilities";

import ChatItem from "./ChatItem";
import { DateDescriptor, System } from "./descriptors";
import checkIsMessageGroup from "./checkIsMessageGroup";

type MessageProps = {
	message: MessageList[string];
	variant: ChatUI.Size;
	index: number;
	isMyRoom: boolean;
	previousMessage: MessageList[string] | null;
	spaceID?: string;
	myRoomID?: string;
	isLastChat: boolean;
	isShowLastChat: boolean;
	isFirstRender: boolean;
	hasNextPage?: boolean;
	clientMessageId?: string;
	lastMessageReadUsers?: import("./types").User[];
	thread?: { count: number; messageLastSentTime: number };
	threadID?: string;
	onMount?: () => void;
	onUnMount?: () => void;
	isSearchTarget?: boolean;
	onRendered?: () => void;

	highlightOnLoad?: boolean;
};

const Message = memo(
	forwardRef<HTMLLIElement, MessageProps>(
		(
			{
				message,
				variant,
				index,
				previousMessage,
				onMount,
				onUnMount,
				highlightOnLoad,
				isSearchTarget,
				onRendered,
				...rest
			},
			ref
		) => {
			const contents = ContentParser(message.content);
			const key = contents as ChatServices.Format2.Container.System;
			const isMessageGroup = checkIsMessageGroup(previousMessage, message);

			const highlightOnTarget = debounce(() => {
				if (typeof ref !== "function" && ref?.current) {
					ref.current.classList.remove("flash-animation");
					void ref.current.offsetWidth;
					ref.current.classList.add("flash-animation");
				}
			}, 300);

			const scrollIntoView = () => {
				if (typeof ref !== "function" && !isSearchTarget) {
					ref?.current?.scrollIntoView({ behavior: "instant" });
					if (highlightOnLoad && rest.isFirstRender) highlightOnTarget();
				}
			};

			useEffect(() => {
				if (!rest.isLastChat) return;
				if (rest.isFirstRender) {
					scrollIntoView();
				} else {
					if (rest.isShowLastChat || message.user?.id === Configure.userID) {
						scrollIntoView();
					}
				}
			}, []);

			useEffect(() => {
				onMount?.();
				return () => onUnMount?.();
			}, []);

			useEffect(() => {
				if (isSearchTarget) {
					onRendered?.();
				}
			}, [isSearchTarget, onRendered]);

			if (isEmpty(key)) return;
			return (
				<Fragment>
					<Maybe test={variant !== "transparent"}>
						<DateDescriptor
							isFirstMessage={!rest.hasNextPage && !rest.spaceID && index === 1}
							timestamp1={message.createdAt}
							timestamp2={index > 0 ? (previousMessage?.createdAt ?? 0) : 0}
							isCreate={(key.type as string) === "vote" || key?.elements[0]?.key !== "create"}
						/>
					</Maybe>
					<Choice value={contents.type} key={message.roomMessageId}>
						<Choice.Case test={"system"}>
							<System
								variant={variant}
								contents={contents as ChatServices.Format2.Container.System}
								ref={ref}
								{...message}
							/>
						</Choice.Case>
						<Choice.CaseElse>
							<ChatItem
								{...message}
								{...rest}
								isMe={message.user?.id === Configure.userID}
								isMessageGroup={isMessageGroup}
								variant={variant}
								ref={ref}
								content={contents as ChatServices.Format2.Message}
							/>
						</Choice.CaseElse>
					</Choice>
				</Fragment>
			);
		}
	),
	(prevProps, nextProps) => {
		const prevMsg = prevProps.message;
		const nextMsg = nextProps.message;
		const prevVoteItems = prevMsg.vote?.items ?? [];
		const nextVoteItems = nextMsg.vote?.items ?? [];
		return (
			prevMsg.roomMessageId === nextMsg.roomMessageId &&
			prevMsg.reactions === nextMsg.reactions &&
			!nextMsg.messageUpdated &&
			prevMsg.replyMessage === nextMsg.replyMessage &&
			prevMsg.thread?.count === nextMsg.thread?.count &&
			prevMsg.deleted === nextMsg.deleted &&
			isEqual(prevVoteItems, nextVoteItems) &&
			isEqual(prevProps.lastMessageReadUsers, nextProps.lastMessageReadUsers) &&
			prevMsg.files === nextMsg.files &&
			prevProps.isSearchTarget === nextProps.isSearchTarget
		);
	}
);

const ContentParser = (content: string): ChatServices.Format2.All => {
	return content
		? JSON.parse(content)
		: {
				type: "richtext",
				elements: [
					{
						type: "text",
						text: ""
					}
				]
			};
};

export default Message;
