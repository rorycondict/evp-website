import { motion } from 'framer-motion';

import heroImg from '@/assets/homepage/promo-tower.webp';
import { HeroSection, Socials, UnderlinedTitle } from '@/components/ui';

/**
 * Connect page hero: background image + overlay + glow, socials at the top,
 * then the page title and subtitle. Title and subtitle are placeholders —
 * swap in the final copy when ready.
 */
export function ConnectHero() {
	return (
		<HeroSection
			image={heroImg}
			imageAlt="The Scottish flag on a cathedral tower"
			minHeight="min-h-120"
		>
			<UnderlinedTitle id="get-involved" title="Get Involved" />

			<motion.p
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 1 }}
				transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
				className="mx-auto max-w-4xl py-5 text-center text-2xl font-bold italic md:text-3xl"
			>
				Stay in the loop. Follow us on our socials:
			</motion.p>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 1 }}
				transition={{ duration: 0.5, ease: 'easeIn' }}
				className="flex justify-center pb-5"
			>
				<Socials className="h-12 w-12" />
			</motion.div>
		</HeroSection>
	);
}
