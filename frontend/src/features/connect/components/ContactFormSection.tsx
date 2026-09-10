import { motion } from 'framer-motion';
import { useState } from 'react';
import { z } from 'zod';

import { buttonVariants, FormField, FormSection, Input, inputVariants } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useSubmitContactForm } from '@/api/generated';

interface FormFields {
	firstName: string;
	lastName: string;
	email: string;
	message: string;
}

const INITIAL_FIELDS: FormFields = { firstName: '', lastName: '', email: '', message: '' };

const emailSchema = z.email({ message: 'Please enter a valid email address.' });

export function ContactFormSection() {
	const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
	const [emailError, setEmailError] = useState<string | null>(null);

	const {
		mutate,
		isPending,
		isSuccess,
		isError,
		error,
		reset: resetMutation,
	} = useSubmitContactForm({
		mutation: {
			onSuccess: () => {
				setFields(INITIAL_FIELDS);
			},
		},
	});

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
		if (e.target.name === 'email') setEmailError(null);

		// If the user starts typing after a previous submission, reset the mutation state
		if (isSuccess || isError) resetMutation();
	}

	function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();

		const { firstName, lastName, email, message } = fields;
		if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) return;

		const parsedEmail = emailSchema.safeParse(email.trim());
		if (!parsedEmail.success) {
			setEmailError(parsedEmail.error.issues[0]?.message ?? 'Please enter a valid email address.');
			return;
		}

		mutate({
			data: {
				first_name: firstName,
				last_name: lastName,
				email: parsedEmail.data,
				message,
			},
		});
	}

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
			<form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4">
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
							disabled={isPending}
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
							disabled={isPending}
							size="md"
						/>
					</FormField>
				</div>

				{/* Email */}
				<FormField id="email-field" label="email">
					<>
						<Input
							id="email-field"
							name="email"
							type="email"
							autoComplete="email"
							value={fields.email}
							onChange={handleChange}
							placeholder="you@example.com"
							disabled={isPending}
							size="md"
						/>
						{emailError && (
							<p role="alert" className="text-error text-center text-sm md:text-left">
								{emailError}
							</p>
						)}
					</>
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
						disabled={isPending}
						className={cn(inputVariants({ size: 'md' }), 'resize-none')}
					/>
				</FormField>
				{/* Submit */}
				<button
					type="submit"
					disabled={isPending || !isComplete}
					className={buttonVariants({ intent: 'primary', size: 'md', className: 'mt-2 w-full' })}
				>
					{isPending ? 'sending...' : isSuccess ? 'sent!' : 'send message'}
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
				{isError && (
					<motion.p
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-error text-center text-lg md:text-left"
					>
						{error.response?.status === 429
							? 'Too many requests - please wait a few minutes and try again.'
							: 'Something went wrong. Please try again later.'}
					</motion.p>
				)}
			</form>
		</FormSection>
	);
}
