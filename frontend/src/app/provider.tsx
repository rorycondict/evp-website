import type { ReactNode } from 'react';

import { ScrollVisibilityProvider } from '@/components/layout/scroll/ScrollVisibilityProvider';
import { ThemeProvider } from '@/components/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<ScrollVisibilityProvider>
				<ThemeProvider>{children}</ThemeProvider>
			</ScrollVisibilityProvider>
		</QueryClientProvider>
	);
}
