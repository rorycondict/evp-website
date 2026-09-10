import { InteractiveLinkButton } from '@/components/ui';
import { ThemeToggle } from './ThemeToggle';

/**
 * Header actions: `ThemeToggle | separator | Get Involved link`.
 * Used in the fixed header (desktop and mobile menu).
 */
export function HeaderActions() {
	return (
		<div className="flex items-center gap-4">
			<ThemeToggle />
			<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
				|
			</span>
			<InteractiveLinkButton
				to="/connect"
				className="px-6 py-2 text-sm tracking-widest uppercase"
				ariaLabel="Connect"
			>
				Get Involved
			</InteractiveLinkButton>
		</div>
	);
}
