import { defineConfig } from 'orval';
export default defineConfig({
	evp: {
		output: {
			mode: 'single',
			target: './src/api/generated.ts',
			client: 'react-query',
			httpClient: 'axios',
		},
		input: {
			target: '../backend/openapi.json',
		},
	},
});
