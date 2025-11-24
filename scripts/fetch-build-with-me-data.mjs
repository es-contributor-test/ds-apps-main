import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

import {
	CATEGORY_STYLES,
	LABEL_CATEGORY_MAP,
	LABEL_DIFFICULTY_MAP,
	LABEL_PROJECT_MAP,
	POINTS_PREFIX,
	getProjectName
} from '../src/data/build-with-me-config.js'

dotenv.config()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'eeshansrivastava89'
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'soma-portfolio'
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'build-with-me-data.json')

if (!GITHUB_TOKEN) {
	console.warn('⚠️  GITHUB_TOKEN not set - skipping Build With Me data fetch')
	console.warn('   Using existing data from src/data/build-with-me-data.json')
	process.exit(0)
}

const headers = {
	Accept: 'application/vnd.github+json',
	Authorization: `Bearer ${GITHUB_TOKEN}`,
	'User-Agent': 'build-with-me-fetch'
}

const fetchJson = async (url) => {
	const res = await fetch(url, { headers })
	if (!res.ok) {
		throw new Error(`GitHub request failed ${res.status}: ${await res.text()}`)
	}
	return res.json()
}

const fetchAllIssues = async () => {
	const issues = []
	let page = 1
	while (true) {
		const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=100&page=${page}`
		const chunk = await fetchJson(url)
		const filtered = chunk.filter((item) => !item.pull_request) // ignore PRs in this list
		issues.push(...filtered)
		if (chunk.length < 100) break
		page++
	}
	return issues
}

const fetchAllPRs = async () => {
	const prs = []
	let page = 1
	while (true) {
		const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=all&per_page=100&page=${page}`
		const chunk = await fetchJson(url)
		prs.push(...chunk)
		if (chunk.length < 100) break
		page++
	}
	return prs
}

const mapLabels = (labels) => {
	const cats = new Set()
	let difficulty
	let points
	let projectSlug = 'ab-sim'

	for (const l of labels) {
		const name = l.name || ''
		if (LABEL_CATEGORY_MAP[name]) cats.add(LABEL_CATEGORY_MAP[name])
		if (LABEL_DIFFICULTY_MAP[name]) difficulty = LABEL_DIFFICULTY_MAP[name]
		if (LABEL_PROJECT_MAP[name]) projectSlug = LABEL_PROJECT_MAP[name]
		if (name.startsWith(POINTS_PREFIX)) {
			const val = parseInt(name.replace(POINTS_PREFIX, ''), 10)
			if (!Number.isNaN(val)) points = val
		}
	}

	return {
		category: Array.from(cats),
		difficulty,
		points,
		projectSlug
	}
}

const mapStatus = (issue, prIndex) => {
	if (issue.state === 'closed') return 'merged'
	if (prIndex.has(issue.number)) {
		const pr = prIndex.get(issue.number)
		if (pr.merged_at) return 'merged'
		if (pr.state === 'open') return 'in-review'
		return 'claimed'
	}
	if (issue.assignee) return 'claimed'
	return 'open'
}

const buildTasks = (issues, prs) => {
	const prIndex = new Map()
	prs.forEach((pr) => prIndex.set(pr.number, pr))

	return issues.map((issue) => {
		const { category, difficulty, points, projectSlug } = mapLabels(issue.labels)
		const status = mapStatus(issue, prIndex)
		const assignees = issue.assignee ? [{ name: issue.assignee.login }] : undefined
		const labels = issue.labels.map((l) => l.name || '').filter(Boolean)

		return {
			id: String(issue.number),
			title: issue.title,
			projectSlug,
			category: category.length ? category : ['frontend'],
			status,
			difficulty,
			points,
			assignees,
			labels,
			githubUrl: issue.html_url
		}
	})
}

const buildHats = (tasks) => {
	const hats = []
	tasks.forEach((task) => {
		if (task.assignees) {
			task.assignees.forEach((a) => {
				hats.push({
					name: a.name,
					hats: task.category,
					status: task.status,
					prNumber: undefined
				})
			})
		}
	})
	return hats
}

const buildLeaderboard = (tasks) => {
	const map = new Map()
	tasks.forEach((task) => {
		if (task.assignees) {
			task.assignees.forEach((a) => {
				const current = map.get(a.name) || {
					name: a.name,
					points: 0,
					mergedPRs: 0,
					reviews: 0,
					docs: 0
				}
				current.points += task.points || 1
				if (task.status === 'merged') current.mergedPRs += 1
				map.set(a.name, current)
			})
		}
	})
	return Array.from(map.values()).sort((a, b) => b.points - a.points)
}

const main = async () => {
	try {
		const [issues, prs] = await Promise.all([fetchAllIssues(), fetchAllPRs()])
		const tasks = buildTasks(issues, prs)

		// Discover projects dynamically from task labels (no hardcoding)
		const projectSlugs = new Set()
		tasks.forEach(task => {
			projectSlugs.add(task.projectSlug)
		})

		// Build cycles only for projects that have issues
		const cycles = Array.from(projectSlugs).map(slug => {
			const projectTasks = tasks.filter(t => t.projectSlug === slug)
			const openTasks = projectTasks.filter(t => t.status === 'open').length
			const claimed = projectTasks.filter(t => t.status === 'claimed' || t.status === 'in-review').length
			const merged = projectTasks.filter(t => t.status === 'merged').length

			return {
				slug,
				name: getProjectName(slug),
				phase: 'Active',
				openTasks,
				claimed,
				mergedThisWeek: merged,
				highlight: merged > 0 ? `${merged} tasks merged` : undefined
			}
		})

		const hats = buildHats(tasks)
		const leaderboard = buildLeaderboard(tasks)

		const payload = {
			cycles,
			tasks,
			hats,
			leaderboard
		}

		fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2))
		console.log(`✅ Wrote data to ${OUTPUT_PATH}`)
		console.log(`   Projects: ${Array.from(projectSlugs).join(', ') || 'none'}`)
		console.log(`   Tasks: ${tasks.length}`)
	} catch (err) {
		console.error('❌ Failed to fetch from GitHub:', err)
		process.exit(1)
	}
}

main()
