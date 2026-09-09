import { InteractiveLinkButton } from '@/components/ui';
import { cn } from '@/utils/cn';

interface SubscribeButtonProps {
	/** Size of the button. */
	size?: 'default' | 'large';
	/** Extra Tailwind classes for the button (e.g. width on mobile). */
	className?: string;
}

export function SubscribeButton({ size = 'default', className }: SubscribeButtonProps) {
	return (
		<>
			<InteractiveLinkButton
				to="/subscribe"
				className={cn(
					'tracking-widest uppercase',
					size === 'large' ? 'px-8 py-3 text-base' : 'px-6 py-2 text-sm',
					className,
				)}
				ariaLabel="Subscribe"
			>
				Subscribe
			</InteractiveLinkButton>
		</>
	);
}
