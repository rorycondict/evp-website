import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/App';

window.addEventListener('vite:preloadError', (event) => {
	const key = 'evp:chunk-reload';
	const last = Number(sessionStorage.getItem(key) ?? 0);
	if (Date.now() - last < 10_000) return;
	sessionStorage.setItem(key, String(Date.now()));
	event.preventDefault();
	window.location.reload();
});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
