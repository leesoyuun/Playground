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
 * @created at Thu Apr 04 2024
 **/

import type { MessageList } from "./types";
import { Utility } from "./utilities";

export default function checkIsMessageGroup(
	prevMessage: MessageList[string] | null,
	currentMessage: MessageList[string]
) {
	let isMessageGroup = false;

	if (prevMessage) {
		if (
			Utility.getDayDiff(prevMessage.createdAt, currentMessage.createdAt, "minute") // 년, 월, 일, 시간, 분
		) {
			if (prevMessage.user?.id === currentMessage.user?.id) {
				isMessageGroup = true;
			}
		}
	}

	if (prevMessage && Utility.json.isJson(prevMessage.content)) {
		const prevMessageContents = JSON.parse(prevMessage.content) as ChatServices.Format2.All;
		prevMessageContents;
		if (prevMessageContents.type === "system") {
			isMessageGroup = false;
		}
	}

	return isMessageGroup;
}
