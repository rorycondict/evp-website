import { PageMeta } from '@/components/ui';
import { ConnectHero, ScoutApplicationsSection, ShareSection } from '@/features/connect';
import { ContactFormSection } from '@/features/contact';
import { NewsletterSection } from '@/features/subscribe';

export default function Connect() {
	return (
		<div className="flex w-full flex-col overflow-x-hidden">
			<PageMeta title="Get Involved" description="See how you can get involved in EVP." />

			<ConnectHero />

			<div className="flex w-full flex-col gap-40 pt-40 pb-25">
				<NewsletterSection />
				<ContactFormSection />
				<ScoutApplicationsSection />
				<ShareSection />
			</div>
		</div>
	);
}
