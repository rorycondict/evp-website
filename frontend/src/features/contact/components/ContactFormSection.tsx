import { motion } from 'framer-motion';
import { useState } from 'react';

import { buttonVariants, FormField, FormSection, Input, inputVariants } from '@/components/ui';
import { cn } from '@/utils/cn';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormFields {
	firstName: string;
	lastName: string;
	email: string;
	message: string;
}

const INITIAL_FIELDS: FormFields = { firstName: '', lastName: '', email: '', message: '' };

/**
 * Contact form section: first/last name, email and message fields in a
 * centered glass-box section. Rendered on the Connect page; posts to
 * /contact-submit once the API layer lands (see TODO in handleSubmit).
 */
export function ContactFormSection() {
	const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
	const [status, setStatus] = useState<FormState>('idle');

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();

		const { firstName, lastName, email, message } = fields;
		if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) return;

		setStatus('submitting');

		try {
			// TODO: POST to /contact-submit once the API layer lands.
			setStatus('success');
			setFields(INITIAL_FIELDS);
		} catch {
			setStatus('error');
		}
	}

	const isSubmitting = status === 'submitting';
	const isSuccess = status === 'success';
	const isComplete =
		!!fields.firstName.trim() &&
		!!fields.lastName.trim() &&
		!!fields.email.trim() &&
		!!fields.message.trim();

	return (
		<FormSection
			id="contact"
			title="Contact Us"
			subtitle="Fill in the form below and we'll get back to you as soon as possible."
		>
			<div className="flex w-full flex-col gap-4">
				{/* Name — first and last side by side */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FormField id="first-name-field" label="first name">
						<Input
							id="first-name-field"
							name="firstName"
							type="text"
							autoComplete="given-name"
							value={fields.firstName}
							onChange={handleChange}
							placeholder="Jane"
							disabled={isSubmitting || isSuccess}
							size="md"
						/>
					</FormField>
					<FormField id="last-name-field" label="last name">
						<Input
							id="last-name-field"
							name="lastName"
							type="text"
							autoComplete="family-name"
							value={fields.lastName}
							onChange={handleChange}
							placeholder="Doe"
							disabled={isSubmitting || isSuccess}
							size="md"
						/>
					</FormField>
				</div>

				{/* Email */}
				<FormField id="email-field" label="email">
					<Input
						id="email-field"
						name="email"
						type="email"
						autoComplete="email"
						value={fields.email}
						onChange={handleChange}
						placeholder="you@example.com"
						disabled={isSubmitting || isSuccess}
						size="md"
					/>
				</FormField>
				{/* Message */}
				<FormField id="message-field" label="message">
					<textarea
						id="message-field"
						name="message"
						rows={6}
						value={fields.message}
						onChange={handleChange}
						placeholder="What can EVP do for you?"
						disabled={isSubmitting || isSuccess}
						className={cn(inputVariants({ size: 'md' }), 'resize-none')}
					/>
				</FormField>
				{/* Submit */}
				<button
					type="button"
					onClick={handleSubmit}
					disabled={isSubmitting || isSuccess || !isComplete}
					className={buttonVariants({ intent: 'primary', size: 'md', className: 'mt-2 w-full' })}
				>
					{isSubmitting ? 'sending...' : isSuccess ? 'sent!' : 'send message'}
				</button>

				{/* Feedback messages */}
				{isSuccess && (
					<motion.p
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-foreground text-center text-lg md:text-left"
					>
						Thanks for reaching out - we'll be in touch soon.
					</motion.p>
				)}
				{status === 'error' && (
					<motion.p
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center text-lg md:text-left"
					>
						Something went wrong. Please try again or email us directly.
					</motion.p>
				)}
			</div>
		</FormSection>
	);
}
