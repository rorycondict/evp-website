import { motion } from 'framer-motion';
import { useMemo } from 'react';

import startupsBkg from '@/assets/startups/startups-bkg.webp';
import { HeroSection, InteractiveLinkButton, PageMeta, UnderlinedTitle } from '@/components/ui';
import { generateColumns, PartnersSection, StartupBlock, STARTUPS } from '@/features/startups';

export default function Startups() {
	const columns = useMemo(() => generateColumns(STARTUPS), []);

	return (
		<div className="w-full overflow-hidden">
			<PageMeta
				title="Our Start-ups"
				description="Learn about the partners & start-ups EVP has worked with."
			/>
			{/* Hero */}
			<HeroSection image={startupsBkg} imageAlt="About Background">
				<UnderlinedTitle id="our-start-ups" title="Our Start-ups" />

				<motion.p
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
					className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold italic"
				>
					Born in Scotland, built for the world.
				</motion.p>

				<motion.p
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.25 }}
					className="mx-auto max-w-2xl pb-5 text-center text-xl"
				>
					We identify the most promising student-led start-ups across Scotland and provide them with
					access to the resources and connections they need to thrive.
				</motion.p>
			</HeroSection>

			<PartnersSection />

			<div className="mx-auto mt-10 flex w-full flex-col gap-12 py-40">
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.8 }}
					transition={{ duration: 0.5, ease: 'easeIn' }}
					className="max-w-3xl text-center text-5xl md:mx-auto"
				>
					<UnderlinedTitle
						id="meet-the-startups"
						navLabel="Meet the Startups"
						title="Meet the student-led ventures we've worked with."
						size="text-5xl"
						level={2}
					/>
				</motion.div>

				{/* 3-Column Ragged Edge Layout */}
				<div className="glass-box mx-auto w-full">
					<div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 py-20 lg:grid-cols-3">
						<div className="flex flex-col items-center gap-6 lg:items-end lg:pt-16">
							{columns.left.map((startup) => (
								<StartupBlock key={startup.id} startup={startup} />
							))}
						</div>

						<div className="flex flex-col items-center gap-6">
							{columns.center.map((startup) => (
								<StartupBlock key={startup.id} startup={startup} />
							))}
						</div>

						<div className="flex flex-col items-center gap-6 lg:items-start lg:pt-32">
							{columns.right.map((startup) => (
								<StartupBlock key={startup.id} startup={startup} />
							))}
						</div>
					</div>
				</div>

				<div className="relative mt-30 flex w-full items-center justify-center">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.5, ease: 'easeIn' }}
						className="border-accent group relative z-10 mx-auto flex h-150 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border-4 text-center"
					>
						<div className="glass-box pointer-events-none absolute inset-0 overflow-hidden" />

						<div className="z-10 flex flex-col items-center justify-center gap-4">
							<UnderlinedTitle
								id="you"
								navLabel="Get Involved"
								title="You?"
								size="text-7xl"
								className="font-title"
								animated={false}
								level={2}
							/>
							<b className="text-foreground text-2xl transition-colors duration-300">
								We'd love to see you up here.
							</b>

							<p className="text-foreground-muted px-10 pb-10 text-xl transition-colors duration-300">
								Share your vision with us, and we'll see it realised.
							</p>

							<InteractiveLinkButton
								to="/connect"
								className="px-20 py-4 text-2xl tracking-widest uppercase md:text-2xl"
								ariaLabel="Get Involved"
							>
								Get Involved
							</InteractiveLinkButton>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
