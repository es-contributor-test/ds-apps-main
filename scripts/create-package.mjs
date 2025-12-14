#!/usr/bin/env node

/**
 * Create Package Script
 * 
 * Creates a new web app package with:
 * - Package directory in packages/{name}/
 * - Hub page at src/pages/projects/{name}.astro
 * - Project yaml at packages/shared/src/data/projects/{name}.yaml
 * - Notebook folder at analytics/notebooks/{name}/
 * - Sample post at src/content/post/{name}-getting-started.md
 * 
 * Convention:
 * - Hub page: /projects/{name}
 * - App: /{name}/
 * 
 * Usage: node scripts/create-package.mjs <package-name> "<Display Name>" "<Short Description>"
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.join(__dirname, 'templates')

// Get arguments
const packageName = process.argv[2]
const displayName = process.argv[3]
const shortDescription = process.argv[4]

if (!packageName || !displayName || !shortDescription) {
	console.error('❌ Usage: node scripts/create-package.mjs <package-name> "<Display Name>" "<Short Description>"')
	console.error('   Example: node scripts/create-package.mjs prompt-debugger "Prompt Debugger" "Visualize and iterate on LLM prompts"')
	process.exit(1)
}

// Validate package name (lowercase, hyphens only)
if (!/^[a-z][a-z0-9-]*$/.test(packageName)) {
	console.error('❌ Package name must be lowercase letters, numbers, and hyphens only')
	console.error('   Example: prompt-debugger, my-cool-app')
	process.exit(1)
}

// Paths
const packageDir = path.join(process.cwd(), 'packages', packageName)
const hubPagePath = path.join(process.cwd(), 'src', 'pages', 'projects', `${packageName}.astro`)
const notebookDir = path.join(process.cwd(), 'analytics', 'notebooks', packageName)
const projectYamlPath = path.join(process.cwd(), 'packages', 'shared', 'src', 'data', 'projects', `${packageName}.yaml`)
const samplePostPath = path.join(process.cwd(), 'src', 'content', 'post', `${packageName}-getting-started.md`)

// Check if package already exists
if (fs.existsSync(packageDir)) {
	console.error(`❌ Package "${packageName}" already exists in packages/`)
	process.exit(1)
}

// Check if hub page already exists
if (fs.existsSync(hubPagePath)) {
	console.error(`❌ Hub page already exists at src/pages/projects/${packageName}.astro`)
	process.exit(1)
}

console.log(`🚀 Creating new package: @eeshans/${packageName}`)
console.log(`   Display Name: ${displayName}`)
console.log(`   Description: ${shortDescription}\n`)

// Template replacements
const today = new Date().toISOString().split('T')[0]
const replacements = {
	'{{PACKAGE_NAME}}': packageName,
	'{{DISPLAY_NAME}}': displayName,
	'{{DESCRIPTION}}': shortDescription,
	'{{DATE}}': today
}

function applyTemplate(templateContent) {
	let result = templateContent
	for (const [placeholder, value] of Object.entries(replacements)) {
		result = result.split(placeholder).join(value)
	}
	return result
}

function readTemplate(templateName) {
	const templatePath = path.join(TEMPLATES_DIR, templateName)
	return fs.readFileSync(templatePath, 'utf8')
}

// Create directory structure
const dirs = [
	packageDir,
	path.join(packageDir, 'src'),
	path.join(packageDir, 'src', 'pages'),
	path.join(packageDir, 'src', 'components'),
	path.join(packageDir, 'public'),
	notebookDir
]

dirs.forEach((dir) => {
	fs.mkdirSync(dir, { recursive: true })
	console.log(`  ✓ ${path.relative(process.cwd(), dir)}/`)
})

// Generate package.json
const packageJson = {
	name: `@eeshans/${packageName}`,
	version: '0.0.1',
	private: true,
	type: 'module',
	scripts: {
		dev: 'astro dev',
		build: 'astro build',
		preview: 'astro preview'
	},
	dependencies: {
		'@astrojs/react': '^3.6.2',
		'@eeshans/shared': 'workspace:*',
		astro: '^4.4.15',
		react: '^18.3.1',
		'react-dom': '^18.3.1'
	},
	devDependencies: {
		'@types/react': '^18.3.12',
		'@types/react-dom': '^18.3.1',
		tailwindcss: '^3.4.17',
		typescript: '^5.7.2'
	}
}

fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify(packageJson, null, 2))
console.log(`  ✓ package.json`)

// Generate astro.config.mjs
const astroConfig = `import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
	integrations: [react(), tailwind()],
	base: '/${packageName}',
	outDir: '../../dist/${packageName}',
	publicDir: 'public',
	build: {
		format: 'directory'
	}
})
`

fs.writeFileSync(path.join(packageDir, 'astro.config.mjs'), astroConfig)
console.log(`  ✓ astro.config.mjs`)

// Generate tailwind.config.js (must match shared theme)
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'./public/**/*.js',
		'../shared/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
	],
	darkMode: ['class'],
	theme: {
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			fontFamily: {
				sans: ['Lato', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
				serif: ['Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif']
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
}
`

fs.writeFileSync(path.join(packageDir, 'tailwind.config.js'), tailwindConfig)
console.log(`  ✓ tailwind.config.js`)

// Generate tsconfig.json
const tsconfig = {
	extends: 'astro/tsconfigs/strict',
	compilerOptions: {
		strictNullChecks: true,
		allowJs: true,
		baseUrl: '.',
		lib: ['es2022', 'dom', 'dom.iterable'],
		jsx: 'react-jsx',
		jsxImportSource: 'react'
	},
	exclude: ['node_modules', '**/node_modules/*', '.vscode', 'dist']
}

fs.writeFileSync(path.join(packageDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2))
console.log(`  ✓ tsconfig.json`)

// Generate README.md from template
const readme = applyTemplate(readTemplate('README.md.template'))
fs.writeFileSync(path.join(packageDir, 'README.md'), readme)
console.log(`  ✓ README.md`)

// Generate src/pages/index.astro from template
const indexAstro = applyTemplate(readTemplate('index.astro.template'))
fs.writeFileSync(path.join(packageDir, 'src', 'pages', 'index.astro'), indexAstro)
console.log(`  ✓ src/pages/index.astro`)

// Generate hub page from template
const hubPage = applyTemplate(readTemplate('hub-page.astro.template'))
fs.writeFileSync(hubPagePath, hubPage)
console.log(`  ✓ src/pages/projects/${packageName}.astro`)

// Generate project yaml from template
const projectYaml = applyTemplate(readTemplate('project.yaml.template'))
fs.writeFileSync(projectYamlPath, projectYaml)
console.log(`  ✓ packages/shared/src/data/projects/${packageName}.yaml`)

// Generate sample notebook from template
const notebook = applyTemplate(readTemplate('getting_started.ipynb.template'))
fs.writeFileSync(path.join(notebookDir, 'getting_started.ipynb'), notebook)
console.log(`  ✓ analytics/notebooks/${packageName}/getting_started.ipynb`)

// Generate sample post from template
const samplePost = applyTemplate(readTemplate('getting-started.md.template'))
fs.writeFileSync(samplePostPath, samplePost)
console.log(`  ✓ src/content/post/${packageName}-getting-started.md`)

// Done!
console.log(`\n✅ Package created successfully!\n`)
console.log(`Next steps:`)
console.log(`  1. pnpm install (from root)`)
console.log(`  2. pnpm --filter @eeshans/${packageName} dev`)
console.log(`  3. Open http://localhost:4321/${packageName}/\n`)
console.log(`Hub page: http://localhost:4321/projects/${packageName}`)
console.log(`\nDon't forget to:`)
console.log(`  - Update tags in packages/shared/src/data/projects/${packageName}.yaml`)
console.log(`  - Add "dev:${packageName}" script to root package.json if needed\n`)
