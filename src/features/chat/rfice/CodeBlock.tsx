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
// import { marked } from "marked";
// import parse from "html-react-parser";

// marked.Renderer.prototype.paragraph = (text: string) => {
// 	return text + "\n";
// };

export default function CodeBlock({ code }: ChatServices.Format2.Elements.CodeBlock) {
	return (
		<CodeContainer>
			<span className="codeBlock">{code}</span>
		</CodeContainer>
	);
}

const CodeContainer = styled.pre`
	border-radius: 6px;
	padding: 6px 10px 6px 10px;
	font-family: "Fira Code", "Courier New", Courier, monospace !important;
	font-size: 13px;
	background-color: #f5f5f5;
	border: solid 1px #ddd;
	color: #0f0f0f;
	white-space: pre-wrap;
`;
