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
 * @created at Wed Jun 05 2024
 **/

import { useState } from "react";

export default function useScrollButtonState() {
	const [scrollButtonState, setScrollButtonState] = useState({
		arrow: false,
		newMessage: false
	});

	const changeScrollButtonState = (type: "clear" | "newMessage" | "arrow") => {
		if (type === "clear") {
			setScrollButtonState({ arrow: false, newMessage: false });
		}

		if (type === "newMessage") {
			setScrollButtonState({ arrow: false, newMessage: true });
		}

		if (type === "arrow") {
			setScrollButtonState({ arrow: true, newMessage: false });
		}
	};

	return { scrollButtonState, changeScrollButtonState };
}
