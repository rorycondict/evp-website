import { motion } from 'framer-motion';

import { PageMeta, SectionDivider, TextLink, UnderlinedTitle } from '@/components/ui';
import { PolicyDropdown } from '@/features/privacy/components/PolicyDropdown';

const icoLinkClass = 'text-accent button-underline font-bold';

/** External link to an ICO guidance page. */
function IcoLink({ to, children }: { to: string; children: React.ReactNode }) {
	return (
		<a href={to} target="_blank" rel="noreferrer" className={icoLinkClass}>
			{children}
		</a>
	);
}

/**
 * Full privacy policy page. The first section (title + summary) is always
 * visible; every other heading is rendered as a collapsible dropdown.
 */
export default function Privacy() {
	return (
		<div className="flex w-full flex-col overflow-x-hidden">
			<PageMeta
				title="Privacy Policy"
				description="How Edinburgh VenturePoint collects, uses, and protects your personal information."
			/>
			<section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-30 pb-10 text-center md:pt-60">
				<UnderlinedTitle title="Privacy Policy" />
				<motion.p
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
					className="mx-auto max-w-4xl py-5 text-center text-2xl font-bold italic md:text-3xl"
				>
					EVP is committed to protecting your personal information.
				</motion.p>
				<motion.p
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.25 }}
					className="mx-auto max-w-2xl pb-5 text-center text-lg md:text-xl"
				>
					A privacy policy is a legal requirement for any website that collects personal
					information, such as names and email addresses.
					<br />
					<br />
					This notice tells you what personal information we need from you, why we need it, and what
					you can expect us to do with it.
				</motion.p>
			</section>

			{/* Dropdown sections */}
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pt-10 pb-30">
				<PolicyDropdown id="contact" title="Contact details">
					<h3 className="text-xl font-bold">Email</h3>
					<p>
						You can reach us through the email contact form on the website:{' '}
						<TextLink to="/connect#contact">www.edinburghventurepoint.com/connect#contact</TextLink>
					</p>
				</PolicyDropdown>

				<PolicyDropdown id="collect" title="What information we collect, use, and why">
					<p>We collect and use your personal information for two main reasons:</p>
					<ul className="flex list-disc flex-col gap-2 pt-2 pl-6">
						<li>
							<b>Contact enquiries:</b> If you use our contact form, we collect your first name,
							last name, email address, and the contents of your message so that we can read and
							respond to your query.
						</li>
						<li>
							<b>Newsletter:</b> If you sign up for our newsletter, we collect your first name, last
							name, and email address to send you updates and marketing communications.
						</li>
					</ul>
				</PolicyDropdown>

				<PolicyDropdown id="lawful" title="Lawful bases and data protection rights">
					<p>
						Under UK data protection law, we must have a &ldquo;lawful basis&rdquo; for collecting
						and using your personal information. There is a list of possible{' '}
						<IcoLink to="https://ico.org.uk/for-organisations/advice-for-small-organisations/getting-started-with-gdpr/data-protection-principles-definitions-and-key-terms/#lawfulbasis">
							lawful bases
						</IcoLink>{' '}
						in the UK GDPR. You can find out more about lawful bases on the ICO&rsquo;s website.
					</p>
					<p>
						Which lawful basis we rely on may affect your data protection rights which are set out
						in brief below. You can find out more about your data protection rights and the
						exemptions which may apply on the ICO&rsquo;s website:
					</p>
					<ul className="flex list-disc flex-col gap-3 pl-6">
						<li>
							<b>Your right of access</b> – You have the right to ask us for copies of your personal
							information. You can request other information such as details about where we get
							personal information from and who we share personal information with. There are some
							exemptions which means you may not receive all the information you ask for.{' '}
							<IcoLink to="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#roa">
								Read more about the right of access
							</IcoLink>
							.
						</li>
						<li>
							<b>Your right to rectification</b> – You have the right to ask us to correct or delete
							personal information you think is inaccurate or incomplete.{' '}
							<IcoLink to="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rtr">
								Read more about the right to rectification
							</IcoLink>
							.
						</li>
						<li>
							<b>Your right to erasure</b> – You have the right to ask us to delete your personal
							information.{' '}
							<IcoLink to="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rte">
								Read more about the right to erasure
							</IcoLink>
							.
						</li>
						<li>
							<b>Your right to restriction of processing</b> – You have the right to ask us to limit
							how we can use your personal information.{' '}
							<IcoLink to="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rtrop">
								Read more about the right to restriction of processing
							</IcoLink>
							.
						</li>
						<li>
							<b>Your right to object to processing</b> – You have the right to object to the
							processing of your personal data.{' '}
							<IcoLink to="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rto">
								Read more about the right to object to processing
							</IcoLink>
							.
						</li>
						<li>
							<b>Your right to data portability</b> – You have the right to ask that we transfer the
							personal information you gave us to another organisation, or to you.{' '}
							<IcoLink to="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rtdp">
								Read more about the right to data portability
							</IcoLink>
							.
						</li>
						<li>
							<b>Your right to withdraw consent</b> – When we use consent as our lawful basis you
							have the right to withdraw your consent at any time.{' '}
							<IcoLink to="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rtwc">
								Read more about the right to withdraw consent
							</IcoLink>
							.
						</li>
					</ul>
					<p>
						If you make a request, we must respond to you without undue delay and in any event
						within one month.
					</p>
					<p>
						To make a data protection rights request, please contact us using the contact details at
						the top of this privacy notice.
					</p>

					<SectionDivider width="w-full" my="my-2" />

					<h3 className="text-xl font-bold">
						Our lawful bases for the collection and use of your data
					</h3>
					<p>Our lawful bases for collecting or using personal information are:</p>
					<ul className="flex list-disc flex-col gap-2 py-2 pl-6">
						<li>
							<b>Consent (for our newsletter):</b> We rely on your active consent when you subscribe
							to our mailing list. You have the right to withdraw this consent at any time by
							clicking the "unsubscribe" link at the bottom of any email or by contacting us
							directly.
						</li>
						<li>
							<b>Legitimate interests (for contact forms):</b> We process your data to review and
							respond to the queries you submit. It is in our legitimate interest to provide
							customer service and communicate with users who reach out to us.
						</li>
					</ul>
					<p>
						For more information on our use of legitimate interests as a lawful basis you can
						contact us using the contact details set out above.
					</p>
				</PolicyDropdown>

				<PolicyDropdown id="sharing" title="Who we share your information with">
					<p>
						We do not sell your personal information. We only share your data with trusted
						third-party service providers who assist us in operating our website and communications.
					</p>
					<p className="pt-2">
						Specifically, we use <IcoLink to="https://resend.com/">Resend</IcoLink> to manage our
						emails, deliver our newsletter, and route contact form submissions. Resend acts as a
						data processor on our behalf and handles your information securely in compliance with
						applicable data protection laws.
					</p>
				</PolicyDropdown>

				<PolicyDropdown id="infofrom" title="Where we get personal information from">
					<ul className="list-disc pl-6">
						<li>Directly from you</li>
					</ul>
				</PolicyDropdown>

				<PolicyDropdown id="retention" title="How long we keep information">
					<p>
						We only retain your personal data for as long as necessary to fulfil the purposes we
						collected it for.
					</p>
					<ul className="flex list-disc flex-col gap-2 py-2 pl-6">
						<li>
							<b>Contact enquiries:</b> Retained until your query is fully resolved and for a short
							administrative period afterwards in case of follow-up questions, after which it is
							deleted.
						</li>
						<li>
							<b>Newsletter subscriptions:</b> Retained actively until you unsubscribe or withdraw
							your consent, at which point your email is removed from our active mailing list.
						</li>
					</ul>
					<p>
						You can request the erasure of your personal data at any time by reaching out to us via
						the contact form.
					</p>
				</PolicyDropdown>

				<PolicyDropdown id="complain" title="How to complain">
					<p>
						If you have any concerns about our use of your personal information, you can make a data
						protection complaint to us:
					</p>
					<p>
						<b>Online:</b>{' '}
						<TextLink to="/connect#contact">www.edinburghventurepoint.com/connect#contact</TextLink>
					</p>
					<p>
						If you remain unhappy with how we&rsquo;ve used your data after raising a complaint with
						us, you can also complain to the ICO.
					</p>
					<p>The ICO&rsquo;s address:</p>
					<address className="not-italic">
						Information Commissioner&rsquo;s Office
						<br />
						Wycliffe House
						<br />
						Water Lane
						<br />
						Wilmslow
						<br />
						Cheshire
						<br />
						SK9 5AF
					</address>
					<p>
						Helpline number: <b>0303 123 1113</b>
						<br />
						Website:{' '}
						<IcoLink to="https://www.ico.org.uk/make-a-complaint">
							https://www.ico.org.uk/make-a-complaint
						</IcoLink>
					</p>
				</PolicyDropdown>
			</div>
		</div>
	);
}
