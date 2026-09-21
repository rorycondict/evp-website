import conference3Img from '@/assets/promo/conference-3.webp';
import present2Img from '@/assets/promo/present-2.webp';
import socialImg from '@/assets/promo/social.webp';

import { ScrollingImageBanner } from '@/components/ui/ScrollingImageBanner';

const eventImages = [
	{ src: socialImg, alt: 'Students collaborating' },
	{ src: present2Img, alt: 'Workshop session' },
	{ src: conference3Img, alt: 'Networking event' },
];

export function EventsBanner() {
	return (
		<ScrollingImageBanner images={eventImages} speed={25} heightClass="h-80" className="w-full" />
	);
}
