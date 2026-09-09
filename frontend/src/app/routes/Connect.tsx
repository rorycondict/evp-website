import { PageMeta } from '@/components/ui';
import { ConnectHero, ScoutApplicationsSection } from '@/features/connect';
import { ContactFormSection } from '@/features/contact';
import { NewsletterSection } from '@/features/subscribe';

export default function Connect() {
	return (
		<div className="flex w-full flex-col overflow-x-hidden">
			<PageMeta title="Get Involved" description="See how you can get involved in EVP." />

			<ConnectHero />

			{/* Connect page sections — add new self-contained sections to this stack. */}
			<div className="flex w-full flex-col gap-10 px-4 pb-25">
				<ContactFormSection />
				<NewsletterSection />
				<ScoutApplicationsSection />
			</div>
		</div>
	);
}
