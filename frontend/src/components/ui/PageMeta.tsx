import { useEffect } from 'react';
import { useLocation } from 'react-router';

interface PageMetaProps {
	title: string;
	description: string;
}

const SITE_URL = 'https://www.edinburghventurepoint.com';

/** Sets a meta tag's content, if the tag exists in index.html. */
function setMetaContent(selector: string, content: string) {
	document.querySelector(selector)?.setAttribute('content', content);
}

/**
 * Updates the document title and the per-page meta tags (description, OG,
 * Twitter, canonical) for the current route.
 */
export function PageMeta({ title, description }: PageMetaProps) {
	const { pathname } = useLocation();

	useEffect(() => {
		const fullTitle = `${title} | EVP`;
		const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`;

		document.title = fullTitle;
		setMetaContent('meta[name="description"]', description);
		setMetaContent('meta[property="og:title"]', fullTitle);
		setMetaContent('meta[property="og:description"]', description);
		setMetaContent('meta[property="og:url"]', url);
		setMetaContent('meta[name="twitter:title"]', fullTitle);
		setMetaContent('meta[name="twitter:description"]', description);
		document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
	}, [title, description, pathname]);

	return null;
}
