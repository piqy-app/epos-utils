import { defineConfig } from 'vite-plus'

const ignoredToolDirectories = [
	'.agent/**',
	'.agents/**',
	'.claude/**',
	'.codex/**',
	'.continue/**',
	'.cursor/**',
	'.docs/**',
	'.gemini/**',
	'.opencode/**',
	'.pi/**',
	'.repos/**',
	'.roo/**',
	'.windsurf/**',
	'tools/oxlint/anti-slop/**',
]

export default defineConfig({
	lint: {
		ignorePatterns: ignoredToolDirectories,
		plugins: ['typescript', 'unicorn', 'import'],
		categories: {
			correctness: 'error',
			suspicious: 'warn',
		},
		jsPlugins: [
			{
				name: 'anti-slop',
				specifier: './tools/oxlint/anti-slop/index.ts',
			},
			{
				name: 'anti-slop-effect',
				specifier: './tools/oxlint/anti-slop/effect/index.ts',
			},
		],
		options: {
			typeAware: true,
			typeCheck: true,
		},
		rules: {
			'typescript/no-non-null-assertion': 'warn',
			'typescript/no-explicit-any': 'warn',
			'typescript/prefer-as-const': 'error',
			'typescript/prefer-enum-initializers': 'error',
			'typescript/no-inferrable-types': 'error',
			'eslint/no-param-reassign': 'error',
			'eslint/default-param-last': 'error',
			'eslint/no-else-return': 'error',
			'eslint/require-yield': 'off',
			'unicorn/prefer-number-properties': 'error',
			'unicorn/prefer-add-event-listener': 'off',
			'import/no-named-as-default-member': 'off',
			'import/no-named-as-default': 'off',
			'anti-slop/no-chained-type-assertions': 'error',
			'anti-slop/no-conditional-empty-object-spread': 'error',
			'anti-slop/no-explicit-return-types': 'error',
			'anti-slop/no-internal-export-all': 'error',
			'anti-slop/no-known-value-widening': 'error',
			'anti-slop/no-manual-tags': 'error',
			'anti-slop/no-module-mocking': 'error',
			'anti-slop/no-nested-ternaries': 'error',
			'anti-slop/no-object-parameters': 'error',
			'anti-slop/no-reflect-apply': 'error',
			'anti-slop/no-reflect-get': 'error',
			'anti-slop/no-runtime-typeof': ['error', { allowInTypeGuards: true }],
			'anti-slop/no-shape-in-symbol-names': 'error',
			'anti-slop/no-switch-statements': 'error',
			'anti-slop/no-unknown-parameters': 'error',
			'anti-slop/no-unknown-returns': 'error',
			'anti-slop/no-unknown-type-aliases': 'error',
			'anti-slop/no-unsafe-dictionary-type': 'error',
			'anti-slop/no-widen-then-assert': 'error',
			'anti-slop/require-safety-comment-for-type-assertion': 'error',
			'anti-slop-effect/no-service-constructor-imports': 'error',
			'anti-slop-effect/prefer-effect-fn': 'error',
		},
	},
	test: {
		include: ['packages/*/tests/**/*.test.ts'],
	},
	fmt: {
		ignorePatterns: ignoredToolDirectories,
		printWidth: 140,
		semi: false,
		singleQuote: true,
		useTabs: true,
		overrides: [
			{
				files: ['*.json', '**/*.json'],
				options: {
					useTabs: false,
				},
			},
		],
	},
})
