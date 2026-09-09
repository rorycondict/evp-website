import { PageMeta } from '@/components/ui';
import { ContactFormSection } from '@/features/contact';
export default function Connect() {
	return (
		<div className="flex w-full items-center justify-center overflow-hidden px-4 pt-35 pb-20">
			<PageMeta title="Get Involved" description="See how you can get involved in EVP." />

			<ContactFormSection />
		</div>
	);
}
