import { defineConfig } from 'orval';
export default defineConfig({
	petstore: {
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
