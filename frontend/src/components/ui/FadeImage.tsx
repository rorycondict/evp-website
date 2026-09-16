import { useEffect, useRef, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type FadeImageProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Image that fades in once it has loaded, instead of popping or scanning in
 * line by line. Shows immediately when the image is already cached or fails
 * to load, so repeat visits don't flash and broken images keep their alt
 * text visible.
 */
export function FadeImage({ className, ...props }: FadeImageProps) {
	const [loaded, setLoaded] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);

	// Cached images can finish loading before React attaches onLoad.
	useEffect(() => {
		if (imgRef.current?.complete) setLoaded(true);
	}, []);

	return (
		<img
			{...props}
			ref={imgRef}
			onLoad={() => setLoaded(true)}
			onError={() => setLoaded(true)}
			className={cn(
				'transition-opacity duration-500',
				loaded ? 'opacity-100' : 'opacity-0',
				className,
			)}
		/>
	);
}
