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
 * @created at Tue May 21 2024
 **/

import { useEffect, useRef, useState } from "react";

export default function useHasScroll(deps: React.DependencyList = []) {
	const containerRef = useRef<HTMLUListElement>(null);
	const [hasScroll, setHasScroll] = useState(false);
	const [isShowScrollDown, setIsShowScrollDown] = useState(false);

	const checkScroll = () => {
		if (containerRef.current) {
			const element = containerRef.current;
			const hasHorizontalScroll = element.scrollWidth > element.clientWidth;
			const hasVerticalScroll = element.scrollHeight > element.clientHeight;
			setHasScroll(hasHorizontalScroll || hasVerticalScroll);
		}
	};

	const onScroll = () => {
		if (!containerRef.current) return;
		const { scrollHeight, scrollTop, clientHeight } = containerRef.current as HTMLElement;
		const scrollUp = scrollHeight - scrollTop - clientHeight;
		if (scrollUp + clientHeight >= 1000) setIsShowScrollDown(true);
		else setIsShowScrollDown(false);
	};

	useEffect(() => {
		if (!containerRef.current) return;
		containerRef.current.addEventListener("scroll", onScroll);
		return () => {
			if (!containerRef.current) return;
			containerRef.current.removeEventListener("scroll", onScroll);
		};
	}, [containerRef.current]);

	useEffect(() => {
		checkScroll();

		window.addEventListener("resize", checkScroll);

		return () => {
			window.removeEventListener("resize", checkScroll);
		};
	}, deps);

	return { ref: containerRef, hasScroll, isShowScrollDown };
}
