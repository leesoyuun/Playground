/**
 * @copyright (C) 2024, zacostudio. All rights reserved
 *
 * @license
 * This software and/or source code may be used, copied and/or disseminated only
 * with the written permission of zacostudio, or in accordance with the terms
 * and conditions stipulated in the agreement/contract under which the software
 * and/or source code has been supplied by zacostudio or its affiliates.
 * Unauthorized use, copying, or dissemination of this file, via any medium, is
 * strictly prohibited, and will constitute an infringement of copyright.
 *
 * @author
 * Jinhyoung Jang (jhyoung75@gmail.com)
 *
 * @description
 *
 * @created at 2024-11-23 11:27:03
 **/

import { Children, cloneElement, type PropsWithChildren, useMemo, type ReactNode } from "react";
import has from "lodash-es/has.js";

/**
 * Represents the properties for a choice object.
 *
 * @template T - The type of the value.
 * @property {T} [value] - The value associated with the choice. Optional.
 * @property {boolean} [use_only_case] - A flag indicating whether only case should be used. Optional.
 */
type ChoiceProps<T> = {
	value?: T;
	use_only_case?: boolean;
};

/**
 * Represents the properties for a case condition.
 *
 * @template T - The type of the input parameter for the test function.
 * @property {T | ((x: T) => boolean)} test - A boolean value or a function
 * that takes an argument of type T and returns a boolean indicating the case condition.
 */
type CaseProps<T> = {
	test: T | ((x: T) => boolean);
};

/**
 * Represents a conditional rendering component that renders its children based on provided props.
 *
 * @param {PropsWithChildren<CaseProps<T>>} props - The props for the `Case` component, including children and conditions to evaluate.
 * @return {ReactNode} The rendered children of the `Case` component.
 */
function Case<T>(props: PropsWithChildren<CaseProps<T>>): ReactNode {
	return <>{props.children}</>;
}

/**
 * A React functional component that wraps and renders its children.
 *
 * @param {PropsWithChildren} props - The properties passed to the component, including its children.
 * @return {ReactNode} The rendered children nodes.
 */
function CaseElse(props: PropsWithChildren): ReactNode {
	return <>{props.children}</>;
}

/**
 * Renders a set of child components based on provided conditions.
 * Filters and clones child elements based on their type and conditions.
 * Supports conditional rendering using `Case` and `CaseElse` components.
 *
 * @param {PropsWithChildren<ChoiceProps<T>>} props - The properties object containing child components, a value for comparison, and optional configuration.
 * @return {ReactNode} A collection of filtered and cloned child components that match the provided conditions or fallback cases.
 */
export default function Choice<T>(props: PropsWithChildren<ChoiceProps<T>>): ReactNode {
	const { use_only_case = true } = props;
	const childrens = useMemo(() => {
		let result = Children.map(props.children, (child, index) => {
			// @ts-expect-error ...
			if (child && child.type.name === Case.name) {
				const contition =
					// @ts-expect-error ...
					typeof child.props.test === "function"
						? // @ts-expect-error ...
							(child.props.test(props.value) as boolean)
						: // @ts-expect-error ...
							child.props.test === props.value;
				if (contition) {
					// @ts-expect-error ...
					const key = has(child.props, "key") ? child.props.key : `${index}`;
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
					return cloneElement(child as any, { key });
				}
				// @ts-expect-error ...
			} else if (child && child.type.name !== CaseElse.name && !use_only_case) {
				// @ts-expect-error ...
				const key = has(child.props, "key") ? child.props.key : `${index}`;
				/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
				return cloneElement(child as any, { key });
			}
			return null;
		})?.filter(Boolean);
		if (result?.length === 0) {
			// when no matched case
			result = Children.map(props.children, (child, index) => {
				// @ts-expect-error ...
				if (child && child.type.name === CaseElse.name) {
					// @ts-expect-error ...
					const key = has(child.props, "key") ? child.props.key : `${index}`;
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
					return cloneElement(child as any, { key });
				}
				return null;
			})?.filter(Boolean);
		}
		return result;
	}, [props.children, props.value, use_only_case]);

	return <>{childrens}</>;
}

Choice.Case = Case;
Choice.CaseElse = CaseElse;
