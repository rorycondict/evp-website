import { motion } from 'framer-motion';
import { useState } from 'react';
import { z } from 'zod';

import {
	AnimatedCheckbox,
	buttonVariants,
	FormField,
	FormSection,
	Input,
	TextLink,
} from '@/components/ui';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormFields {
	firstName: string;
	lastName: string;
	email: string;
}

const INITIAL_FIELDS: FormFields = { firstName: '', lastName: '', email: '' };

const emailSchema = z.email({ message: 'Please enter a valid email address.' });

/**
 * Newsletter sign-up section: optional first/last name, required email and a
 * consent checkbox linking to the privacy policy and terms of service. Will
 * post to /newsletter-subscribe once the API layer lands (see TODO in
 * handleSubmit).
 */
export function NewsletterSection() {
	const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
	const [consent, setConsent] = useState(false);
	const [status, setStatus] = useState<FormState>('idle');
	const [emailError, setEmailError] = useState<string | null>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
		if (e.target.name === 'email') setEmailError(null);
		// Any edit after a successful submit returns the form to its idle state.
		if (status === 'success') setStatus('idle');
	}

	async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!fields.email.trim() || !consent) return;

		const email = emailSchema.safeParse(fields.email.trim());
		if (!email.success) {
			setEmailError(email.error.issues[0]?.message ?? 'Please enter a valid email address.');
			return;
		}

		setStatus('submitting');

		try {
			// TODO: POST to /newsletter-subscribe once the API layer lands.
			setStatus('success');
			setFields(INITIAL_FIELDS);
			setConsent(false);
		} catch {
			setStatus('error');
		}
	}

	const isSubmitting = status === 'submitting';
	const isSuccess = status === 'success';
	const canSubmit = !!fields.email.trim() && consent;

	return (
		<FormSection
			id="newsletter"
			title="Our Newsletter"
			subtitle="Get event announcements, start-up spotlights and scout news straight to your inbox."
		>
			<form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FormField id="newsletter-first-name-field" label="first name">
						<Input
							id="newsletter-first-name-field"
							name="firstName"
							type="text"
							autoComplete="given-name"
							value={fields.firstName}
							onChange={handleChange}
							placeholder="John"
							disabled={isSubmitting}
							size="md"
						/>
					</FormField>
					<FormField id="newsletter-last-name-field" label="last name">
						<Input
							id="newsletter-last-name-field"
							name="lastName"
							type="text"
							autoComplete="family-name"
							value={fields.lastName}
							onChange={handleChange}
							placeholder="Doe"
							disabled={isSubmitting}
							size="md"
						/>
					</FormField>
				</div>

				{/* Email */}
				<FormField id="newsletter-email-field" label="email">
					<>
						<Input
							id="newsletter-email-field"
							name="email"
							type="email"
							autoComplete="email"
							value={fields.email}
							onChange={handleChange}
							placeholder="you@example.com"
							disabled={isSubmitting}
							size="md"
						/>
						{emailError && (
							<p role="alert" className="text-error text-center text-sm md:text-left">
								{emailError}
							</p>
						)}
					</>
				</FormField>

				{/* Consent */}
				<div className="flex items-start gap-3 pt-1 text-left">
					<AnimatedCheckbox
						id="newsletter-consent"
						ariaLabel="Consent to receiving emails from EVP"
						checked={consent}
						onChange={setConsent}
						disabled={isSubmitting}
					/>
					<p className="text-sm leading-relaxed">
						I have read and agree to the <TextLink to="/privacy">privacy policy</TextLink> and{' '}
						<TextLink to="/terms">terms of service</TextLink>, and consent to receiving emails from
						EVP.
					</p>
				</div>

				{/* Submit */}
				<button
					type="submit"
					disabled={isSubmitting || !canSubmit}
					className={buttonVariants({ intent: 'primary', size: 'md', className: 'mt-2 w-full' })}
				>
					{isSubmitting ? 'subscribing...' : isSuccess ? 'subscribed!' : 'subscribe'}
				</button>

				{/* Feedback messages */}
				{isSuccess && (
					<motion.p
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-foreground text-center text-lg md:text-left"
					>
						You're on the list - keep an eye on your inbox.
					</motion.p>
				)}
				{status === 'error' && (
					<motion.p
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-error text-center text-lg md:text-left"
					>
						Something went wrong. Please try again later.
					</motion.p>
				)}
			</form>
		</FormSection>
	);
}
