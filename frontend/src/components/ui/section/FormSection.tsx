import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { MediaTextSection } from './MediaTextSection';
import { SectionDivider } from './SectionDivider';

interface FormSectionProps {
	/** Background image shown beside the section content. */
	image: string;
	imageAlt: string;
	/** Section heading text. */
	title: string;
	/** Intro copy rendered under the heading. */
	subtitle?: string;
	/** Anchor id on the heading, e.g. "#contact" deep links. */
	id?: string;
	/** Render the content on the left and the image on the right. */
	reverse?: boolean;
	/** Image height class forwarded to MediaTextSection. Defaults to "h-160". */
	imageHeight?: string;
	/** Extra classes on the outer glass-box section. */
	className?: string;
	/** Section body: form fields, buttons, feedback messages, etc. */
	children: ReactNode;
}

/**
 * Glass-box form section: image on one side, heading + divider + subtitle and
 * arbitrary content (usually a form) on the other. Shared by the Connect page
 * sections (contact form, newsletter, scout applications, ...) so new
 * sections only need content and an image.
 */
export function FormSection({
	image,
	imageAlt,
	title,
	subtitle,
	id,
	reverse = false,
	imageHeight = 'h-160',
	className,
	children,
}: FormSectionProps) {
	return (
		<section className={cn('glass-box w-full overflow-hidden py-25 md:py-40', className)}>
			<MediaTextSection
				image={image}
				imageAlt={imageAlt}
				imageHeight={imageHeight}
				reverse={reverse}
				className="md:flex-row md:items-start"
				textClassName="md:items-start md:text-left"
			>
				<h2 id={id} className="-scroll-mt-25 text-4xl font-bold md:text-5xl">
					{title}
				</h2>
				<SectionDivider width="w-75 md:w-100" my="my-2" />
				{subtitle && <p className="text-lg md:text-xl">{subtitle}</p>}
				{children}
			</MediaTextSection>
		</section>
	);
}
