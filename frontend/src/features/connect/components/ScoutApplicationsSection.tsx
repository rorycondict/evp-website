import { motion } from 'framer-motion';
import { Handshake, Network, Plane } from 'lucide-react';

import { FormSection, InteractiveLinkButton } from '@/components/ui';
import { slideIn } from '@/utils/motion';

const SCOUT_APPLICATION_URL: string = 'https://forms.gle/RqNQGFDTQBMXX2MR8';

const SCOUT_PERKS = [
	{
		icon: Handshake,
		title: 'Direct Investor Networks',
		body: 'Connect with real angel investors and syndicates, such as Apollo Informal Investments.',
	},
	{
		icon: Plane,
		title: 'All Expenses-Paid Trips',
		body: 'EVP is not just limited to Edinburgh: field trips to scout out start-ups at universities across the UK.',
	},
	{
		icon: Network,
		title: 'Insider Startup Access',
		body: 'Exclusive access to EVP events, demo days, and the brightest founders in the Edinburgh startup scene.',
	},
] as const;

export function ScoutApplicationsSection() {
	return (
		<FormSection
			id="scout-applications"
			title="Venture Scout Applications"
			subtitle=<strong>
				Each semester, EVP handpicks a few student 'venture scouts' following a vetted application
				process.
			</strong>
		>
			<p className="text-lg">
				You'll learn how to evaluate early-stage start-ups, meet founders across every discipline,
				and work directly with EVP's committee and our partners in the Edinburgh startup ecosystem.
			</p>
			<div className="grid w-full gap-5 md:grid-cols-3">
				{SCOUT_PERKS.map(({ icon: Icon, title, body }, index) => (
					<motion.div
						key={title}
						{...slideIn('left', index * 0.2)}
						className="glass-box flex flex-col items-center gap-2 px-5 py-5 text-center"
					>
						<Icon className="text-accent h-10 w-10 stroke-1" aria-hidden="true" />
						<h3 className="text-xl font-bold">{title}</h3>
						<p>{body}</p>
					</motion.div>
				))}
			</div>
			<p className="text-lg">
				EVP is designed to be flexible around your studies, with just a few hours a week of
				scouting, events, and team discussions.
			</p>
			<InteractiveLinkButton
				to={SCOUT_APPLICATION_URL}
				className="my-5 mt-5 px-30 py-5 text-2xl tracking-widest md:px-50"
			>
				Apply Now
			</InteractiveLinkButton>
			<strong>
				If your written application is successful, we will invite you to a short online interview.
				<br />
				We review applications on a rolling basis and places are limited, <u>so apply early.</u>
			</strong>
		</FormSection>
	);
}
