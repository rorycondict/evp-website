import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';

import { PageLoader } from '@/components/ui';

import AppLayout from './AppLayout';
import Error from './routes/Error';
import Home from './routes/Home';

const About = lazy(() => import('./routes/About'));
const Startups = lazy(() => import('./routes/Startups'));
const Contact = lazy(() => import('./routes/Contact'));
const Events = lazy(() => import('./routes/Events'));
const Privacy = lazy(() => import('./routes/Privacy'));
const Terms = lazy(() => import('./routes/Terms'));
const Connect = lazy(() => import('./routes/Connect'));

const withSuspense = (el: React.ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

export const router = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout />,
		errorElement: <Error />,
		children: [
			{
				errorElement: <Error />,
				children: [
					{ index: true, element: <Home /> },
					{ path: 'about', element: withSuspense(<About />) },
					{ path: 'startups', element: withSuspense(<Startups />) },
					{ path: 'contact', element: withSuspense(<Contact />) },
					{ path: 'events', element: withSuspense(<Events />) },
					{ path: 'privacy', element: withSuspense(<Privacy />) },
					{ path: 'terms', element: withSuspense(<Terms />) },
					{ path: 'connect', element: withSuspense(<Connect />) },
					{
						path: '*',
						loader: () => {
							throw new Response('Not Found', { status: 404 });
						},
					},
				],
			},
		],
	},
]);
