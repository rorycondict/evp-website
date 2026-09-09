import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ScrollVisibilityProvider } from '@/components/layout/scroll/ScrollVisibilityProvider';
import { ThemeProvider } from '@/components/theme';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

export function AppProvider({ children }: { children: ReactNode }) {
	return (
		<ScrollVisibilityProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>{children}</ThemeProvider>
			</QueryClientProvider>
		</ScrollVisibilityProvider>
	);
}
