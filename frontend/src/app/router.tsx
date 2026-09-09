import { createBrowserRouter } from 'react-router';

import AppLayout from './AppLayout';
import About from './routes/About';
import Contact from './routes/Contact';
import Error from './routes/Error';
import Events from './routes/Events';
import Home from './routes/Home';
import Privacy from './routes/Privacy';
import Startups from './routes/Startups';
import Terms from './routes/Terms';
import Subscribe from './routes/Subscribe';

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
					{ path: 'about', element: <About /> },
					{ path: 'startups', element: <Startups /> },
					{ path: 'contact', element: <Contact /> },
					{ path: 'events', element: <Events /> },
					{ path: 'privacy', element: <Privacy /> },
					{ path: 'terms', element: <Terms /> },
					{ path: 'subscribe', element: <Subscribe /> },

					// catch all for invalid pages
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
