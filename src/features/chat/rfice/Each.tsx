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
 * @created at Fri Jan 26 2024
 **/

import { Children, type ReactElement } from "react";

type EachProps<T> = {
	render: (item: T, index: number) => ReactElement | null;
	of: T[] | undefined;
	useArray?: boolean;
};

export default function Each<T>({ render, of, useArray = false }: EachProps<T>) {
	if (!of) {
		return null;
	}

	return useArray
		? Children.toArray(of.map((item, index) => render(item, index)))
		: of.map((item, index) => render(item, index));
}
