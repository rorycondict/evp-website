import { PageMeta } from '@/components/ui';
import {
	ConnectHero,
	ScoutApplicationsSection,
	ShareSection,
	NewsletterSection,
} from '@/features/connect';
import { ContactFormSection } from '@/features/contact';

export default function Connect() {
	return (
		<div className="flex w-full flex-col overflow-x-hidden">
			<PageMeta title="Get Involved" description="See how you can get involved in EVP." />

			<ConnectHero />

			<div className="flex w-full flex-col gap-20 pt-20 pb-25 md:gap-40 md:pt-40">
				<NewsletterSection />
				<ContactFormSection />
				<ScoutApplicationsSection />
				<ShareSection />
			</div>
		</div>
	);
}
