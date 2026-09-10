import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { useScrollVisibility } from '@/components/layout/scroll/use-scroll-visibility';
import { cn } from '@/utils/cn';

import { HeaderActions } from './HeaderActions';
import { LogoAndTitle } from './LogoAndTitle';
import { HeaderNavButtons } from './nav-link-buttons/NavLinkButtons';

interface HeaderProps {
	transitionDuration?: number;
	slideDistance?: number;
}

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function Header({ transitionDuration = 600, slideDistance = 100 }: HeaderProps) {
	const location = useLocation();
	const isHomePage = location.pathname === '/';
	const { isScrolledPast } = useScrollVisibility();

	const [trackedPathname, setTrackedPathname] = useState(location.pathname);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	if (location.pathname !== trackedPathname) {
		setTrackedPathname(location.pathname);
		setMobileMenuOpen(false);
	}

	// Close the mobile menu with the Escape key.
	useEffect(() => {
		if (!mobileMenuOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setMobileMenuOpen(false);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [mobileMenuOpen]);

	const visible = !isHomePage || isScrolledPast;
	const transition = `opacity ${transitionDuration}ms ${EASING}, transform ${transitionDuration}ms ${EASING}`;

	return (
		<header
			className={cn('fixed z-50 w-full', 'bg-background/70 shadow-md backdrop-blur-xs')}
			style={{
				transition,
				opacity: visible ? 1 : 0,
				transform: `translateY(${visible ? 0 : -slideDistance}px)`,
				pointerEvents: visible ? 'auto' : 'none',
				viewTransitionName: 'site-header',
			}}
			aria-hidden={!visible}
		>
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
				<div className="flex flex-1 justify-start">
					<LogoAndTitle isLarge={false} />
				</div>

				<nav className="hidden shrink-0 flex-wrap items-center justify-center gap-4 md:flex md:gap-6">
					<HeaderNavButtons />
				</nav>

				<div className="flex flex-1 items-center justify-end">
					<div className="hidden md:block">
						<HeaderActions />
					</div>

					<button
						className="text-foreground p-2 md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle mobile menu"
						aria-expanded={mobileMenuOpen}
						aria-controls="mobile-menu"
					>
						{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						id="mobile-menu"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className="bg-background absolute top-full left-0 w-full overflow-hidden border-t shadow-lg md:hidden"
					>
						<div className="flex flex-col gap-6 p-6">
							<nav className="flex flex-col gap-4">
								<HeaderNavButtons />
							</nav>
							<hr className="border-border" />
							<div className="flex flex-col gap-4">
								<HeaderActions />
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
