import { useEffect, useRef, useState } from 'react';

import { Check, Copy } from 'lucide-react';

import websiteQrImg from '@/assets/website-qr.webp';

import { Button, FormSection } from '@/components/ui';

const WEBSITE_URL = 'https://www.edinburghventurepoint.com';
const WEBSITE_LABEL = 'edinburghventurepoint.com';

export function ShareSection() {
	const [copied, setCopied] = useState(false);
	const copyTimeoutRef = useRef<number | null>(null);

	// Clear any pending copy-feedback timer when the section unmounts.
	useEffect(() => {
		return () => {
			if (copyTimeoutRef.current !== null) clearTimeout(copyTimeoutRef.current);
		};
	}, []);

	function showCopiedFeedback() {
		setCopied(true);
		if (copyTimeoutRef.current !== null) clearTimeout(copyTimeoutRef.current);
		copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
	}

	async function handleShare() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Edinburgh VenturePoint | Get Involved',
					url: WEBSITE_URL,
				});
				return;
			} catch {
				// Fall back to the clipboard if the user cancels the native share.
			}
		}

		await handleCopyUrl();
	}

	async function handleCopyUrl() {
		try {
			await navigator.clipboard.writeText(WEBSITE_URL);
			showCopiedFeedback();
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	}

	return (
		<FormSection
			id="share"
			title="Share Our Website"
			subtitle={
				<>
					<span className="mb-5 block text-2xl">
						Know someone who should get involved with EVP?
					</span>
					<strong>Share this website and send them our way.</strong>
				</>
			}
		>
			<div className="flex w-full flex-col items-center gap-4">
				<div className="rounded-3xl bg-white p-2 shadow-lg">
					<img
						src={websiteQrImg}
						alt="QR code linking to the EVP Connect page"
						className="h-75 w-75"
					/>
				</div>

				<Button
					intent="primary"
					size="md"
					onClick={handleShare}
					className="mt-4 px-10 py-3 text-xl"
				>
					<p className="button-underline">Share Website</p>
				</Button>

				<button
					type="button"
					onClick={handleCopyUrl}
					className="button-underline flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-lg break-all opacity-70 transition-opacity hover:opacity-100"
					aria-label={`Copy ${WEBSITE_LABEL} to clipboard`}
					title={copied ? 'Copied!' : 'Copy link'}
				>
					{copied ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
					<span>{WEBSITE_LABEL}</span>
				</button>
			</div>
		</FormSection>
	);
}
