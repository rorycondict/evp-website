import apolloImg from '@/assets/partner/apollo.webp';
import googleCloudImg from '@/assets/partner/google-cloud.webp';
import natwestImg from '@/assets/partner/natwest.webp';
import youngEdgeImg from '@/assets/partner/young-edge.webp';

import type { Partner } from '../types';

export const PARTNERS: Partner[] = [
	{
		id: 'young-edge',
		name: 'Young EDGE',
		img: youngEdgeImg,
	},
	{
		id: 'google-cloud',
		name: 'Google Cloud',
		img: googleCloudImg,
	},
	{
		id: 'natwest',
		name: 'NatWest',
		img: natwestImg,
	},
	{
		id: 'apollo-informal-investments',
		name: 'Apollo Informal Investments',
		img: apolloImg,
	},
];
