import type { ReactNode } from 'react';

import { ScrollVisibilityProvider } from '@/components/layout/scroll/ScrollVisibilityProvider';
import { ThemeProvider } from '@/components/theme';

export function AppProvider({ children }: { children: ReactNode }) {
	return (
		<ScrollVisibilityProvider>
			<ThemeProvider>{children}</ThemeProvider>
		</ScrollVisibilityProvider>
	);
}
