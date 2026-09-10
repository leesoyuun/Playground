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

import Text from "./Text";
import Section from "./Section";

export default function BlockQuote({ elements }: ChatServices.Format2.Elements.BlockQuote) {
	return (
		<blockquote>
			{elements.map((element, index) => {
				switch (element.type) {
					case "section": {
						return (
							<p key={index}>
								<Section {...element} />
							</p>
						);
					}
					case "text": {
						return (
							<p key={index}>
								<Text {...element} />
							</p>
						);
					}
					default: {
						return null;
					}
				}
			})}
		</blockquote>
	);
}
