import type { ReactNode } from 'react';

import chatLaptopImg from '@/assets/promo/chat-laptop.webp';
import eventIntroImg from '@/assets/promo/event-intro.webp';
import pub2Img from '@/assets/promo/pub-2.webp';
import { PromoCard } from '@/components/ui';

/**
 * Three glass promo cards showcasing EVP's offerings (angel syndicates,
 * exclusive programmes, top tech societies). Used on the Contact page.
 */
export function OfferCardsSection() {
	const cards: { img: string; title: string; body: ReactNode }[] = [
		{
			img: eventIntroImg,
			title: 'Angel Syndicates',
			body: (
				<p>
					We have close relationships with some of the oldest and most established angel syndicates
					in the world.
				</p>
			),
		},
		{
			img: chatLaptopImg,
			title: 'Exclusive Programmes',
			body: (
				<p>
					We work with accelerators, government-funded programs, and others to provide student
					founders with opportunities to grow their businesses
				</p>
			),
		},
		{
			img: pub2Img,
			title: 'Top Tech Societies',
			body: (
				<p>
					We are a CompSoc Special Interest Group. Our members have access to everything the largest
					computer science society in Scotland has to offer.
				</p>
			),
		},
	];

	return (
		<section className="w-full md:pt-25">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-10 overflow-x-hidden p-4 md:flex-row md:items-start">
				{cards.map(({ img, title, body }, i) => (
					<PromoCard
						key={i}
						image={img}
						title={title}
						body={body}
						index={i}
						className="md:min-h-200"
					/>
				))}
			</div>
		</section>
	);
}
