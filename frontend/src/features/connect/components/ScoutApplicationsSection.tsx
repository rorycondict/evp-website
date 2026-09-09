import { FormSection, InteractiveLinkButton } from '@/components/ui';

// TODO: add URL when applications open
const SCOUT_APPLICATION_URL: string | null = null;

export function ScoutApplicationsSection() {
	return (
		<FormSection
			id="scout-applications"
			title="Venture Scout Applications"
			subtitle={
				<p>
					Each semester, EVP handpicks a few student 'venture scouts' following a vetted application
					process.
				</p>
			}
		>
			{SCOUT_APPLICATION_URL ? (
				<InteractiveLinkButton
					to={SCOUT_APPLICATION_URL}
					className="mt-5 px-30 py-3 text-xl tracking-widest uppercase"
				>
					Apply Now
				</InteractiveLinkButton>
			) : (
				<p className="text-accent text-2xl font-bold italic md:text-3xl">
					Coming soon - applications opening <u>Week 1</u>
				</p>
			)}
		</FormSection>
	);
}
