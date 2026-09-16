import { Outlet, ScrollRestoration } from 'react-router';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/header/Header';
import { ScrollSpy } from '@/components/layout/scroll/ScrollSpy';

export default function AppLayout() {
	return (
		<>
			<div className="bg-background text-foreground relative flex min-h-screen flex-col justify-between transition-colors duration-200">
				<div className="relative z-10 flex min-h-screen flex-col justify-between">
					<Header />
					<main className="mb-auto flex">
						<Outlet />
					</main>
					<Footer />
				</div>

				<ScrollRestoration />
				<ScrollSpy />
			</div>
		</>
	);
}
