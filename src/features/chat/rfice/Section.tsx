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

import Each from "./Each";
import Text from "./Text";
import Link from "./Link";
import User from "./User";

export default function Section({
	elements,
	isList,
	activityFontColor
}: ChatServices.Format2.Elements.Section & { isList?: boolean; activityFontColor?: string }) {
	const WrapperTag = isList ? "span" : "div";
	// const text = elements?.filter((element) => element.type === "text");
	// const link = elements?.filter((element) => element.type === "link");
	// const user = elements?.filter((element) => element.type === "user");
	// elements = [...(text || []), ...(link || []), ...(user || [])];
	return (
		<WrapperTag style={{ width: "100%", color: activityFontColor || "inherit" }}>
			<Each
				of={elements}
				render={(element, index) => {
					switch (element.type) {
						case "text": {
							return <Text key={index} {...element} lineFeed={false} />;
						}

						case "link": {
							return <Link key={index} {...element} nextElement={elements[index + 1]} />;
						}

						case "user": {
							return <User key={index} {...element} />;
						}

						default: {
							return null;
						}
					}
				}}
			/>
		</WrapperTag>
	);
}
