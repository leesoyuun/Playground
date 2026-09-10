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
 * FE_PTVang (ptvang@rsupartners.com)
 *
 * @description
 *
 * @created at Mon Dec 23 2024
 **/

const ORDERED = "ordered";
const MAKE_LIST = "makeList";

function addStartListOrdered(data: ChatServices.Format2.Elements.List[]) {
	if (data.length >= 3 && data[0].marker === ORDERED) {
		let cumulativeStart = 1;
		return data.map((item) => {
			if (item.marker === ORDERED) {
				const start = cumulativeStart;
				cumulativeStart += item.elements.length;
				return {
					...item,
					start
				};
			} else {
				return item;
			}
		});
	} else {
		return data;
	}
}

export default function formatRichText(data: ChatServices.Format2.Elements.AllRichtextElements[] | undefined) {
	if (!data) return undefined;

	const mergedData = [];
	let tempGroup: ChatServices.Format2.Elements.List[] = [];

	for (const item of data) {
		if (item.type === MAKE_LIST) {
			if (tempGroup.length === 0) {
				tempGroup.push(item);
			} else if (tempGroup[0].marker === ORDERED) {
				tempGroup.push(item);
			} else {
				mergedData.push(...tempGroup);
				tempGroup = [item];
			}
		} else {
			const tempGroupAddStart = addStartListOrdered(tempGroup);
			mergedData.push(...tempGroupAddStart);
			tempGroup = [];
			mergedData.push(item);
		}
	}

	const tempGroupAddStart = addStartListOrdered(tempGroup);
	mergedData.push(...tempGroupAddStart);

	return mergedData;
}
