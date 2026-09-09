import scoutImg from '@/assets/contact/promo-scout.webp';
import { FormSection, InteractiveLinkButton } from '@/components/ui';

/**
 * Link to the scout application form (route or external URL). While this is
 * null the section shows a "coming soon" notice; set it to swap in an apply
 * button when applications open.
 */
const SCOUT_APPLICATION_URL: string | null = null;

/**
 * Scout applications section on the Connect page. Currently a "coming soon"
 * placeholder — set SCOUT_APPLICATION_URL above to enable the apply button.
 */
export function ScoutApplicationsSection() {
	return (
		<FormSection
			id="scout-applications"
			image={scoutImg}
			imageAlt="A group photo with several members of EVP's committee"
			title="Scout Applications"
			subtitle="Each semester, EVP handpicks a few student 'venture scouts' following a vetted application process."
		>
			{SCOUT_APPLICATION_URL ? (
				<InteractiveLinkButton
					to={SCOUT_APPLICATION_URL}
					className="px-6 py-2 text-xl tracking-widest uppercase"
				>
					Apply now
				</InteractiveLinkButton>
			) : (
				<p className="text-lg font-bold italic md:text-xl">
					Coming soon - applications open next semester. Watch this space!
				</p>
			)}
		</FormSection>
	);
}
