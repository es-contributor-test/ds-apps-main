import type { Category, Status, Difficulty } from '../data/build-with-me-config'

export interface Task {
	id: string
	title: string
	projectSlug: string
	category: Category[]
	status: Status
	difficulty?: Difficulty
	assignees?: { name: string; avatarUrl?: string }[]
	closedBy?: { name: string; avatarUrl?: string }
	labels?: string[]
	skills?: string[]
	estimatedHours?: string
	isGoodFirstIssue?: boolean
	githubUrl: string
	updatedAt?: string
	closedAt?: string
	startDate?: string
	targetDate?: string
}

export interface Cycle {
	slug: string
	name: string
	phase: string
	openTasks: number
	claimed: number
	mergedThisWeek: number
	highlight?: string
}

export interface Hat {
	name: string
	hats: Category[]
	status: Status
	prNumber?: number
}

export interface Contributor {
	name: string
	avatarUrl?: string
	mergedPRs: number
	reviews: number
	recentActivityCount?: number
}

export interface ActivityItem {
	type: 'merged' | 'claimed' | 'pr-opened'
	taskId: string
	taskTitle: string
	user: string
	avatarUrl?: string
	timestamp: string
	githubUrl: string
}

export interface BuildWithMeData {
	cycles: Cycle[]
	tasks: Task[]
	hats: Hat[]
	contributors: Contributor[]
	recentActivity: ActivityItem[]
	lastFetchTime?: string
}

export function validateBuildWithMeData(data: unknown): BuildWithMeData | null {
	if (!data || typeof data !== 'object') {
		console.error('❌ Invalid data: not an object')
		return null
	}

	const d = data as Record<string, unknown>

	if (!Array.isArray(d.cycles)) {
		console.error('❌ Invalid data: cycles must be array')
		return null
	}

	if (!Array.isArray(d.tasks)) {
		console.error('❌ Invalid data: tasks must be array')
		return null
	}

	if (!Array.isArray(d.hats)) {
		console.error('❌ Invalid data: hats must be array')
		return null
	}

	if (!Array.isArray(d.contributors)) {
		console.error('❌ Invalid data: contributors must be array')
		return null
	}

	if (!Array.isArray(d.recentActivity)) {
		console.error('❌ Invalid data: recentActivity must be array')
		return null
	}

	// Validate each task has required fields
	for (const task of d.tasks) {
		if (typeof task !== 'object' || !task) {
			console.error('❌ Invalid task: not an object', task)
			return null
		}
		const t = task as Record<string, unknown>
		if (!t.id || !t.title || !t.githubUrl || !Array.isArray(t.category)) {
			console.error('❌ Invalid task: missing required fields', task)
			return null
		}
	}

	// Type assertion is safe here because we've validated the structure
	return {
		cycles: d.cycles as Cycle[],
		tasks: d.tasks as Task[],
		hats: d.hats as Hat[],
		contributors: d.contributors as Contributor[],
		recentActivity: d.recentActivity as ActivityItem[],
		lastFetchTime: d.lastFetchTime as string | undefined
	}
}
