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

import parse from "html-react-parser";

export default function Text({
	text,
	style,
	lineFeed,
	isFromSearchResult
}: ChatServices.Format2.Elements.Text & { lineFeed?: boolean; isFromSearchResult?: boolean }) {
	// original text
	const rawText = (text + (lineFeed ? "\n" : ""))
		.replace(/<span id='search-text'>/g, "___SEARCH_START___")
		.replace(/<\/span>/g, "___SEARCH_END___")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\n/gi, "<br />")
		.replace(/___SEARCH_START___/g, "<span id='search-text'>")
		.replace(/___SEARCH_END___/g, "</span>");
	// change from < > to &lt; &gt;
	const filteredText = (text + (lineFeed ? "\n" : ""))
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\n/gi, "<br />");

	// 메세지 입력시에는 <> 특수문자 변환 하지만 검색 결과에서는 원본 텍스트를 그대로 보여줘야 함
	let _text = isFromSearchResult ? rawText : filteredText;

	if (style?.bold) _text = `<strong>${_text}</strong>`;
	if (style?.italic) _text = `<em>${_text}</em>`;
	if (style?.underline) _text = `<u>${_text}</u>`;
	if (style?.strike) _text = `<strike>${_text}</strike>`;
	if (style?.code) _text = `<code>${_text}</code>`;

	return (_text.length > 0 && parse(_text)) || null;
}
