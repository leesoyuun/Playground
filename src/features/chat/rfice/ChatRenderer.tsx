/* eslint-disable @typescript-eslint/no-unused-vars */
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
 * @created at Tue Dec 19 2023
 **/

import { forwardRef, useEffect, useMemo } from "react";
type ReactQuillProps = Record<never, never>;
import styled from "@emotion/styled";
import { marked } from "marked";


import Each from "./Each";
import { Column, Row, TypographyCSS } from "./primitives";
import { Utility } from "./utilities";

import RenderItem from "./RenderItem";
import { ErrorBoundary } from "./ErrorBoundary";
import formatRichText from "./formatRichText";
import { useFileExtensions } from "./utilities";

interface ChatRendererProps extends ReactQuillProps {
	startLine?: number;
	maxLine?: number;
	chatForm?: ChatServices.Format2.Message;
	className?: string;
	onClick?: (item: ChatServices.Format2.Elements.AllRichtextElements) => void;
	emergency?: boolean;
	isUpdated?: boolean;
	files?: import("./types").MessageData["files"];
	isMe?: boolean;
	isActivity?: boolean;
	activityFontColor?: string;
	isFromSearchResult?: boolean;
}

marked.Renderer.prototype.paragraph = (text: string) => {
	return text + "\n";
};

function ChatRendererErrorFallback({ chatForm }: { chatForm?: ChatServices.Format2.Message }) {
	useEffect(() => {
		console.warn("#ChatRenderer# 채팅 메시지 구조 에러", chatForm);
	}, []);
	return null;
}

const ChatRenderer = forwardRef<HTMLDivElement, ChatRendererProps>(
	(
		{
			chatForm,
			className,
			onClick,
			startLine,
			maxLine,
			files,
			emergency = false,
			isMe = false,
			isActivity = false,
			activityFontColor,
			isFromSearchResult = false
		},
		ref
	) => {
		const { getFileExtension } = useFileExtensions();

		// Activity일 경우 여러줄 메세지에 대한 처리
		if (isActivity && chatForm && chatForm?.elements.length > 1) {
			const element = chatForm.elements[0];
			// text 여러줄일 경우 처리
			if (element.type === "text") element.text = element.text.slice(0, 21) + "...";
			// emoticon일 경우 처리
			if (element.type === "emoticon") {
				// emoticon과 text 같이 보여줌
				maxLine = 2;
				// 그 다음 text가 여러줄일 경우
				const element2 = chatForm.elements[1];
				if (element2.type === "text" && chatForm?.elements.length > 2)
					element2.text = element2.text.slice(0, 21) + "...";
			}
		}

		// files 필터링 로직 추가
		const filteredFiles = useMemo(() => {
			if (!files || files.length === 0) return files;

			const linkFiles = files.filter((file) => Utility.convert.stringToJSON(file.data)?.type === "link");
			const otherFiles = files.filter((file) => Utility.convert.stringToJSON(file.data)?.type !== "link");

			// 링크와 파일이 같이 있을 경우 링크 썸네일은 미노출한다는 조건
			if (otherFiles.length > 0 && linkFiles.length > 0) {
				return otherFiles;
			}

			// 링크가 두개 이상일 경우 첫번째 링크의 썸네일만 노출, 링크 썸네일는 가장 마지막에 노출한다는 조건
			if (linkFiles.length > 1) {
				const linkFile =
					linkFiles.find((link) => (Utility.convert.stringToJSON(link.data) as ChatServices.Format2.Elements.Link)?.info?.image) || linkFiles[0];
				return [...otherFiles, linkFile];
			}

			return files;
		}, [files]);

		// 첨부된 파일은 이미지 -> 비디오 -> 파일 순으로 정렬되어야 한다, 첨부된 파일들은 각각의 타입별로 개행되어야 한다는 조건
		const { imagesList, videosList, filesList, restList } = useMemo(() => {
			if (!filteredFiles || filteredFiles.length === 0)
				return { imagesList: [], videosList: [], filesList: [], restList: [] };

			const images: typeof filteredFiles = [];
			const videos: typeof filteredFiles = [];
			const files: typeof filteredFiles = [];
			const rest: typeof filteredFiles = [];

			filteredFiles.forEach((file) => {
				const parsed = Utility.convert.stringToJSON(file.data);
				if (!parsed) return;
				if (parsed.type === "image") images.push(file);
				else if (parsed.type === "file")
					getFileExtension(parsed.mime) === "video" ? videos.push(file) : files.push(file);
				else rest.push(file);
			});

			return { imagesList: images, videosList: videos, filesList: files, restList: rest };
		}, [filteredFiles]);

		const elements = chatForm?.elements.slice(startLine, maxLine);
		const listElements = formatRichText(elements);

		const images = elements?.filter((element) => element.type === "image");
		const _files = elements?.filter((element) => element.type === "file");

		return (
			<ErrorBoundary fallback={<ChatRendererErrorFallback chatForm={chatForm} />}>
				<StyledRenderer ref={ref} className={`w-100 h-full  ${className ?? ""} `} emergency={emergency}>
					<Each
						of={listElements}
						render={(item, index) => {
							if (item.type === "image" || item.type === "file") return null;
							return (
								<RenderItem
									key={index}
									onClick={onClick}
									isActivity={isActivity}
									activityFontColor={activityFontColor}
									isFromSearchResult={isFromSearchResult}
									{...item}
								/>
							);
						}}
					/>

					{/* IMAGE */}
					{imagesList && imagesList.length > 0 && (
						<FileListRenderer
							fileList={imagesList}
							onClick={onClick}
							isMe={isMe}
							isActivity={isActivity}
							activityFontColor={activityFontColor}
						/>
					)}

					{/* VIDEO */}
					{videosList && videosList.length > 0 && (
						<FileListRenderer
							fileList={videosList}
							onClick={onClick}
							isMe={isMe}
							isActivity={isActivity}
							activityFontColor={activityFontColor}
							isVideo={true}
						/>
					)}

					{/* FILE */}
					{filesList && filesList.length > 0 && (
						<FileListRenderer
							fileList={filesList}
							onClick={onClick}
							isMe={isMe}
							isActivity={isActivity}
							activityFontColor={activityFontColor}
						/>
					)}

					{/* REST */}
					{restList && restList.length > 0 && (
						<FileListRenderer
							fileList={restList}
							onClick={onClick}
							isMe={isMe}
							isActivity={isActivity}
							activityFontColor={activityFontColor}
						/>
					)}

					{images && images.length > 0 && (
						<Row style={{ width: "100%", flexWrap: "wrap", marginTop: "4px" }} gap={4}>
							<Each
								of={images}
								render={(item, index) => {
									return (
										<RenderItem
											key={index}
											onClick={onClick}
											isActivity={isActivity}
											activityFontColor={activityFontColor}
											isFromSearchResult={isFromSearchResult}
											{...item}
											single={images.length === 1}
										/>
									);
								}}
							/>
						</Row>
					)}

					{_files && _files.length > 0 && (
						<Column style={{ width: "100%", marginTop: "4px" }} gap={4}>
							<Each
								of={_files}
								render={(item, index) => {
									return (
										<RenderItem
											key={index}
											onClick={onClick}
											isActivity={isActivity}
											activityFontColor={activityFontColor}
											isFromSearchResult={isFromSearchResult}
											{...item}
										/>
									);
								}}
							/>
						</Column>
					)}
				</StyledRenderer>
			</ErrorBoundary>
		);
	}
);

export default ChatRenderer;

interface FileListRendererProps {
	fileList: import("./types").MessageData["files"];
	onClick?: (item: ChatServices.Format2.Elements.AllRichtextElements) => void;
	isMe?: boolean;
	isActivity?: boolean;
	activityFontColor?: string;
	isVideo?: boolean;
}

const FileListRenderer = ({
	fileList,
	onClick,
	isMe,
	isActivity,
	activityFontColor,
	isVideo = false
}: FileListRendererProps) => {
	if (!fileList || fileList.length === 0) return null;

	return (
		<Row style={{ width: "100%", flexWrap: "wrap", marginTop: "4px", marginBottom: "4px" }} gap={4}>
			<Each
				of={fileList}
				render={(item, index) => {
					const data = JSON.parse(item.data) as
						| ChatServices.Format2.Elements.File
						| ChatServices.Format2.Elements.Image
						| ChatServices.Format2.Elements.Link;
					const singleImage = fileList.filter((v) => JSON.parse(v.data).type === "image").length === 1;

					return (
						<RenderItem
							key={index}
							onClick={onClick}
							{...data}
							isFile
							single={singleImage}
							isSingleFile={fileList.length === 1}
							isMe={isMe}
							isActivity={isActivity}
							activityFontColor={activityFontColor}
							isVideo={isVideo}
						/>
					);
				}}
			/>
		</Row>
	);
};

const StyledRenderer = styled.div<{ emergency: boolean }>`
	position: relative;
	width: -webkit-fill-available;
	word-break: break-all;
	word-wrap: break-word;
	${({ emergency }) => TypographyCSS("Body2", emergency ? "warning_80_100" : "neutral_90_100")}

	a {
		text-decoration: underline;
		color: ${({ theme }) => theme.colors.deco9_50_100};
		cursor: pointer;
	}

	.ql-toolbar {
		display: none;
	}

	.mention {
		${TypographyCSS("Title2", "accent_40_100")}
	}

	code {
		color: ${({ theme }) => theme.colors.deco15_50_100};
		background-color: #f0f0f0;
		border-radius: 3px;
		font-size: 85%;
		padding: 2px 4px;
		white-space: normal;
	}

	ul,
	ol {
		${TypographyCSS("Body2")}
		padding-left: 0;
		padding-inline-start: 0.2em;
		list-style-position: inside;
	}
	ol > li {
		list-style-type: decimal;
	}
	ul > li {
		list-style-type: disc;
	}

	blockquote {
		border-left: 4px solid #ccc;
		margin-bottom: 5px;
		margin-top: 5px;

		p {
			padding-left: 16px;
		}
	}
`;
