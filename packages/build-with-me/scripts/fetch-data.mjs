import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

import {
	CATEGORY_STYLES,
	LABEL_CATEGORY_MAP,
	LABEL_DIFFICULTY_MAP,
	LABEL_PROJECT_MAP,
	getProjectName
} from '../src/data/build-with-me-config.js'

// Load .env from monorepo root
dotenv.config({ path: path.join(process.cwd(), '../../.env') })

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

// Fetch project item dates via GraphQL
const fetchProjectDates = async () => {
	const query = `
		query {
			user(login: "${REPO_OWNER}") {
				projectV2(number: 1) {
					items(first: 100) {
						nodes {
							content {
								... on Issue { number }
							}
							fieldValues(first: 10) {
								nodes {
									... on ProjectV2ItemFieldDateValue {
										date
										field { ... on ProjectV2FieldCommon { name } }
									}
								}
							}
						}
					}
				}
			}
		}
	`
	
	try {
		const res = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				...headers,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query })
		})
		
		if (!res.ok) {
			console.warn('⚠️  Could not fetch project dates (may need project scope)')
			return new Map()
		}
		
		const data = await res.json()
		const dateMap = new Map()
		
		const items = data?.data?.user?.projectV2?.items?.nodes || []
		for (const item of items) {
			const issueNumber = item.content?.number
			if (!issueNumber) continue
			
			const dates = { startDate: null, targetDate: null }
			for (const fieldValue of item.fieldValues?.nodes || []) {
				if (fieldValue?.field?.name === 'Start date') {
					dates.startDate = fieldValue.date
				} else if (fieldValue?.field?.name === 'Target date') {
					dates.targetDate = fieldValue.date
				}
			}
			dateMap.set(issueNumber, dates)
		}
		
		return dateMap
	} catch (err) {
		console.warn('⚠️  GraphQL fetch failed:', err.message)
		return new Map()
	}
}

const mapLabels = (labels) => {
	const cats = new Set()
	const skills = []
	let difficulty
	let projectSlug = 'ab-sim'
	let estimatedHours
	let isGoodFirstIssue = false

	for (const l of labels) {
		const name = l.name || ''
		if (LABEL_CATEGORY_MAP[name]) cats.add(LABEL_CATEGORY_MAP[name])
		if (LABEL_DIFFICULTY_MAP[name]) difficulty = LABEL_DIFFICULTY_MAP[name]
		if (LABEL_PROJECT_MAP[name]) projectSlug = LABEL_PROJECT_MAP[name]
		// Extract learning skills
		if (name.startsWith('learn:')) {
			skills.push(name.replace('learn:', ''))
		}
		// Extract estimated hours
		if (name.startsWith('hours:')) {
			estimatedHours = name.replace('hours:', '')
		}
		// Check for good first issue
		if (name === 'good first issue') {
			isGoodFirstIssue = true
		}
	}

	return {
		category: Array.from(cats),
		difficulty,
		projectSlug,
		skills,
		estimatedHours,
		isGoodFirstIssue
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

const buildTasks = (issues, prs, dateMap) => {
	const prIndex = new Map()
	prs.forEach((pr) => prIndex.set(pr.number, pr))

	return issues.map((issue) => {
		const { category, difficulty, projectSlug, skills, estimatedHours, isGoodFirstIssue } = mapLabels(issue.labels)
		const status = mapStatus(issue, prIndex)
		// Include avatar URL from GitHub
		const assignees = issue.assignee 
			? [{ name: issue.assignee.login, avatarUrl: issue.assignee.avatar_url }] 
			: undefined
		// Track who closed the issue (for merged attribution)
		const closedBy = issue.closed_by
			? { name: issue.closed_by.login, avatarUrl: issue.closed_by.avatar_url }
			: undefined
		const labels = issue.labels.map((l) => l.name || '').filter(Boolean)
		
		// Get dates from project
		const dates = dateMap.get(issue.number) || {}

		return {
			id: String(issue.number),
			title: issue.title,
			projectSlug,
			category: category.length ? category : ['frontend'],
			status,
			difficulty,
			assignees,
			closedBy,
			labels,
			skills,
			estimatedHours,
			isGoodFirstIssue,
			githubUrl: issue.html_url,
			updatedAt: issue.updated_at,
			closedAt: issue.closed_at,
			startDate: dates.startDate,
			targetDate: dates.targetDate
		}
	})
}

// Build recent activity feed from tasks
const buildRecentActivity = (tasks) => {
	const activities = []
	
	tasks.forEach((task) => {
		// Add merged events - prefer closedBy, fallback to assignee
		if (task.status === 'merged' && task.closedAt) {
			const mergedByUser = task.closedBy || task.assignees?.[0]
			activities.push({
				type: 'merged',
				taskId: task.id,
				taskTitle: task.title,
				user: mergedByUser?.name || 'someone',
				avatarUrl: mergedByUser?.avatarUrl,
				timestamp: task.closedAt,
				githubUrl: task.githubUrl
			})
		}
		// Add claimed events
		else if ((task.status === 'claimed' || task.status === 'in-review') && task.assignees?.length) {
			activities.push({
				type: task.status === 'in-review' ? 'pr-opened' : 'claimed',
				taskId: task.id,
				taskTitle: task.title,
				user: task.assignees[0].name,
				avatarUrl: task.assignees[0].avatarUrl,
				timestamp: task.updatedAt,
				githubUrl: task.githubUrl
			})
		}
	})
	
	// Sort by timestamp (most recent first) and take top 10
	return activities
		.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
		.slice(0, 10)
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

const buildContributors = (tasks, recentActivity) => {
	const map = new Map()
	
	// Count recent activity per user (last 7 days)
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
	const recentActivityByUser = new Map()
	recentActivity.forEach((activity) => {
		if (new Date(activity.timestamp) > sevenDaysAgo) {
			const count = recentActivityByUser.get(activity.user) || 0
			recentActivityByUser.set(activity.user, count + 1)
		}
	})
	
	tasks.forEach((task) => {
		if (task.assignees) {
			task.assignees.forEach((a) => {
				const current = map.get(a.name) || {
					name: a.name,
					avatarUrl: a.avatarUrl,
					mergedPRs: 0,
					reviews: 0,
					recentActivityCount: 0
				}
				if (task.status === 'merged') current.mergedPRs += 1
				// Keep the avatar URL if we have it
				if (a.avatarUrl && !current.avatarUrl) current.avatarUrl = a.avatarUrl
				// Add recent activity count
				current.recentActivityCount = recentActivityByUser.get(a.name) || 0
				map.set(a.name, current)
			})
		}
	})
	// Sort by merged PRs descending
	return Array.from(map.values()).sort((a, b) => b.mergedPRs - a.mergedPRs)
}

const main = async () => {
	try {
		const [issues, prs, dateMap] = await Promise.all([
			fetchAllIssues(),
			fetchAllPRs(),
			fetchProjectDates()
		])
		const tasks = buildTasks(issues, prs, dateMap)

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
		const recentActivity = buildRecentActivity(tasks)
		const contributors = buildContributors(tasks, recentActivity)

		const payload = {
			cycles,
			tasks,
			hats,
			contributors,
			recentActivity,
			lastFetchTime: new Date().toISOString()
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
