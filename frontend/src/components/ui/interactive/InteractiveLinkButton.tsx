import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Link } from 'react-router';

import { cn } from '@/utils/cn';

interface InteractiveLinkButtonProps {
	/** Route the button navigates to. */
	to: string;
	/** Button label or content. */
	children: ReactNode;
	/** Extra Tailwind classes for sizing and typography (e.g. padding, text size). */
	className?: string;
	/** Optional accessible label. */
	ariaLabel?: string;
}

/**
 * Interactive pill-shaped link button: a cursor-tracking spotlight, animated
 * gradient blobs, and an underline-on-hover label. Shared by the "Reach out"
 * contact button and the header "Get Involved" button.
 */
export function InteractiveLinkButton({
	to,
	children,
	className,
	ariaLabel,
}: InteractiveLinkButtonProps) {
	const linkRef = useRef<HTMLAnchorElement>(null);

	return (
		<Link
			ref={linkRef}
			to={to}
			viewTransition
			aria-label={ariaLabel}
			className={cn(
				'group bg-accent hover:bg-accent-dark relative flex overflow-hidden text-center font-bold text-white shadow-lg transition-colors duration-200',
				className,
			)}
		>
			<span className="button-underline relative z-10 drop-shadow-md">{children}</span>
		</Link>
	);
}
