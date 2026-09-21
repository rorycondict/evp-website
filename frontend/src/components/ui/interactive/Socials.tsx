import { FaDiscord, FaInstagram, FaLinkedin } from 'react-icons/fa6';

interface SocialsProps {
	className?: string;
}

const SOCIALS = [
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/company/edinburghventurepoint/',
		Icon: FaLinkedin,
	},
	{
		label: 'Instagram',
		href: 'https://www.instagram.com/edinburghventurepoint/',
		Icon: FaInstagram,
	},
	{ label: 'Discord', href: 'https://discord.gg/p3FF8C5zU4', Icon: FaDiscord },
	// TODO
	// { label: 'TikTok', href: '', Icon: FaTiktok },
	// { label: 'RedNote', href: '', Icon: SiXiaohongshu },
];

export function Socials({ className = 'h-6 w-6 md:h-5 md:w-5' }: SocialsProps) {
	const linkClass =
		'button-underline flex cursor-pointer items-center justify-center p-2 hover:text-foreground transition-colors';

	return (
		<div className="flex flex-row items-center justify-center gap-2">
			{SOCIALS.map(({ label, href, Icon }) => (
				<a
					key={label}
					href={href || undefined}
					target="_blank"
					rel="noopener noreferrer"
					className={linkClass}
					aria-label={label}
					title={label}
				>
					<Icon className={className} />
				</a>
			))}
		</div>
	);
}
