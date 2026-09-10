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

import Text from "./Text";
import Section from "./Section";
import Link from "./Link";
import User from "./User";

function printListItem(elements: ChatServices.Format2.Elements.List["elements"]) {
	return elements.map((element, index) => {
		switch (element.type) {
			case "section": {
				return (
					<li key={index}>
						<Section {...element} isList />
					</li>
				);
			}
			case "text": {
				return (
					<li key={index}>
						<Text {...element} lineFeed />
					</li>
				);
			}
			case "link": {
				return (
					<li key={index}>
						<Link {...element} />
					</li>
				);
			}
			case "user": {
				return (
					<li key={index}>
						<User {...element} />
					</li>
				);
			}
			default: {
				return null;
			}
		}
	});
}

export default function List({ marker, elements, start }: ChatServices.Format2.Elements.List & { start?: number }) {
	switch (marker) {
		case "bullet": {
			return <ul>{printListItem(elements)}</ul>;
		}
		case "ordered": {
			return <ol start={start}>{printListItem(elements)}</ol>;
		}
	}
	return null;
}
