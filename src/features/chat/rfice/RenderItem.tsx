/* eslint-disable @typescript-eslint/no-unused-vars */
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
 * Jinhyoung Jang (jangjh@rsupport.com)
 *
 * @description
 *
 * @created at Wed Jan 17 2024
 **/

import styled from "@emotion/styled";
import { css } from "@emotion/react";

import Section from "./Section";
import Text from "./Text";
import Link from "./Link";
import List from "./List";
import User from "./User";
import CodeBlock from "./CodeBlock";
import BlockQuote from "./BlockQuote";
import ChatEmoticon from "./ChatEmoticon";
import ChatImage from "./ChatImage";
import ContentPreview from "./ContentPreview";

type RenderItemProps = ChatServices.Format2.Elements.AllRichtextElements & {
	isFile?: boolean;
	isSingleFile?: boolean;
	single?: boolean;
	isMe?: boolean;
	isVideo?: boolean;
	isActivity?: boolean;
	activityFontColor?: string;
	isFromSearchResult?: boolean;
};
export function getEmojis() {
	const emojis: string[] = [];

	const ranges = [
		[0x1f601, 0x1f64f], // Emoticons
		[0x1f300, 0x1f5ff], // Misc Symbols and Pictographs
		[0x1f680, 0x1f6ff] // Transport and Map
	];

	for (const range of ranges) {
		for (let i = range[0]; i <= range[1]; i++) {
			emojis.push(String.fromCodePoint(i));
		}
	}

	return emojis;
}
export default function RenderItem(
	props: RenderItemProps & { onClick?: (item: ChatServices.Format2.Elements.AllRichtextElements) => void }
) {
	return (
		<StyledWrapper
			className="chat-font"
			type={props.type}
			text={props.type === "text" ? props?.text : undefined}
			isActivity={props.isActivity}
			activityFontColor={props.activityFontColor}
			isVideo={props.isVideo}
		>
			{props.type === "section" && <Section {...props} />}
			{props.type === "text" && <Text {...props} lineFeed isFromSearchResult={props.isFromSearchResult} />}
			{props.type === "link" && <Link {...props} />}
			{props.type === "makeList" && <List {...props} />}
			{props.type === "user" && <User {...props} />}
			{props.type === "codeBlock" && <CodeBlock {...props} />}
			{props.type === "blockquote" && <BlockQuote {...props} />}
			{props.type === "emoticon" && <ChatEmoticon {...props} />}
			{props.type === "image" && <ChatImage {...props} />}
			{props.type === "file" && <ContentPreview {...props} enableQuickPlay={!props.isActivity} />}
		</StyledWrapper>
	);
}
const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\u200D)+$/u;
const StyledWrapper = styled.div<{
	type: ChatServices.Format2.Elements.AllTypes;
	text?: string;
	isActivity?: boolean;
	isVideo?: boolean;
	activityFontColor?: string;
}>`
	font-size: ${({ type, text }) => {
		if (type === "text" && !text) return 15;
		if (type === "text" && text && emojiRegex.test(text)) return "22px";
		return "15px";
	}};
	padding: ${({ type, text }) => {
		if (type === "text" && text && emojiRegex.test(text)) return "1px";
		return 0;
	}};
	width: ${({ type }) => {
		switch (type) {
			case "image": {
				return null;
			}
			default: {
				return "100%";
			}
		}
	}};
	max-width: ${({ type, isVideo }) => {
		switch (type) {
			case "file": {
				return isVideo ? "640px" : "280px";
			}
			default: {
				return "100%";
			}
		}
	}};

	${({ isActivity, type, activityFontColor }) =>
		isActivity && type === "text"
			? css`
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
					text-overflow: ellipsis;
					word-break: break-word;
					color: ${activityFontColor};
				`
			: ""}
`;
