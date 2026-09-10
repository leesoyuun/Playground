/**
 * @copyright (C) 2023, rsupport. All rights reserved
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
 * @created at Fri May 26 2023
 **/

import { useEffect, useRef, useState, type DependencyList } from "react";

/**
 * @param callback 화면상에 표시됐을때 실행할 함수.
 * @param dependencies 의존성 배열
 * @param options IntersectionObserver 옵션
 * @returns ```tsx
 * 	type observerRef = (node: Element) => void; // 감지를 원하는 dom에 주입할 ref
 *  type isShow = boolean; // 해당 dom이 화면에 렌더됐는지 여부
 *
 * 	examples
 *  <li ref={index === list.length - 1 ? observerRef : null}/>
 * ```
 */
export default function useIntersectionObserver<E extends HTMLElement>(
	callback?: (node: IntersectionObserverEntry) => void,
	dependencies: DependencyList = [],
	options: IntersectionObserverInit = { threshold: 1, root: null, rootMargin: "0px 0px 0px 0px" }
) {
	const observerRef = useRef<E>(null);
	const [isShow, setIsShow] = useState(false);

	useEffect(() => {
		const target = observerRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				setIsShow(entries[0].isIntersecting);
				callback && callback(entries[0]);
			},
			{ ...options }
		);
		observer.observe(target);
		return () => {
			observer.unobserve(target);
		};
	}, [observerRef.current, ...dependencies]);

	return { observerRef, isShow };
}
