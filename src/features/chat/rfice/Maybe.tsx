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
 * @created at 2024-11-26 09:23:49
 **/

import { type ReactNode, Children, type PropsWithChildren, useCallback } from "react";
import has from "lodash-es/has.js";

type TestType<T> = T | (() => boolean) | null;
type MaybeProps<T> = {
	test?: TestType<T>;
	fallback?: ReactNode;
	debug?: string;
};

/**
 * A function to test and return the result based on the type of the provided input.
 * If the input is a function, it calls the function and returns its result.
 * Otherwise, it directly returns the input value.
 *
 * @param {TestType} test - The input test value which can be either a function or another type.
 * @returns {*} The result of invoking the function if the input is a function,
 *              or the input value itself otherwise.
 */
function testing<T>(test: TestType<T>) {
	if (typeof test === "function") {
		return (test as () => boolean)();
	}
	return test;
}

/**
 * Conditionally renders children components based on a test condition.
 *
 * @param {PropsWithChildren<MaybeProps>} props - The properties object. It should contain 'test', 'children', and optionally 'fallback'.
 * - props.test: A condition to evaluate.
 * - props.children: The child components to conditionally render.
 * - props.fallback: An optional fallback component to render if the condition fails.
 * @return {ReactNode} The rendered components based on the condition.
 */
export default function Maybe<T>(props: PropsWithChildren<MaybeProps<T>>): ReactNode {
	const condition = (props.test && testing<T>(props.test!)) || false;
	const has_fallback = useCallback(() => {
		let count = 0;
		Children.forEach(props.children, (child) => {
			try {
				// @ts-expect-error ...
				count += child.type === Maybe.Fallback ? 1 : 0;
			} catch {
				// ignoring
			}
		});
		return count > 0;
	}, [props.children]);

	const render_children = useCallback(() => {
		if (has_fallback()) {
			return Children.map(props.children, (child) => {
				try {
					// @ts-expect-error ...
					if ((!condition && child.type !== Maybe.Fallback) || (condition && child.type === Maybe.Fallback)) {
						return null;
					}
					return <>{child}</>;
				} catch {
					return null;
				}
			});
		}
		return condition ? <>{props.children}</> : null;
	}, [condition, has_fallback, props.children]);

	if (props.debug) {
		console.debug(`${props.debug}`, testing<T>(props.test!));
	}

	if (!has(props, "test")) {
		return <>{props.children}</>;
	}

	if (!condition && !has_fallback()) {
		if (props.fallback) {
			return <>{props.fallback}</>;
		}
	}

	return render_children();
}

/**
 * Class representing a fallback mechanism for a Maybe monad.
 */
Maybe.Fallback = (props: PropsWithChildren) => {
	return <>{props.children}</>;
};
