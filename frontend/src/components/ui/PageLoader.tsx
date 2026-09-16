import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';

/** How long to wait before showing the spinner, to avoid a flash on fast loads. */
const SPINNER_DELAY_MS = 200;

interface PageLoaderProps {
	/** Milliseconds to wait before the spinner appears. Defaults to 200. */
	delay?: number;
	className?: string;
}

/**
 * Suspense fallback for lazy-loaded routes. Renders an empty content area
 * first, then fades in a branded spinner if the chunk takes longer than
 * `delay` to load — so fast loads never flash a spinner.
 */
export function PageLoader({ delay = SPINNER_DELAY_MS, className }: PageLoaderProps) {
	const [showSpinner, setShowSpinner] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => setShowSpinner(true), delay);
		return () => clearTimeout(timeout);
	}, [delay]);

	return (
		<div
			role="status"
			aria-label="Loading page"
			className={cn('flex min-h-[60vh] w-full items-center justify-center', className)}
		>
			{showSpinner && (
				<div className="border-foreground/15 border-t-highlight size-10 animate-spin rounded-full border-[3px]" />
			)}
		</div>
	);
}
