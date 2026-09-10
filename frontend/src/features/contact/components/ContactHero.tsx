import { motion } from 'framer-motion';

import contactImg from '@/assets/homepage/promo-tower.webp';
import { HeroSection, InteractiveLinkButton, UnderlinedTitle } from '@/components/ui';

/**
 * Contact page hero: background image + overlay + glow + title + socials.
 * Rendered inside the Contact route page.
 */
export function ContactHero() {
	return (
		<HeroSection image={contactImg} imageAlt="The Scottish flag on a cathedral tower">
			<UnderlinedTitle id="get-in-touch" title="Get in Touch" />

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 1 }}
				transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
				className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold italic"
			>
				Founder, investor or student - we'd love to hear from you.
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 1 }}
				transition={{ duration: 0.5, ease: 'easeIn', delay: 0.3 }}
				className="mx-auto"
			>
				<p className="mb-5 text-center text-xl">
					Our contact form is always open. We'll be in touch.
				</p>
				<InteractiveLinkButton
					to="/connect#contact"
					className="mx-auto w-fit px-20 py-3 text-xl tracking-widest uppercase"
				>
					Contact Us
				</InteractiveLinkButton>
			</motion.div>
		</HeroSection>
	);
}
