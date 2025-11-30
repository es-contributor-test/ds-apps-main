import { getCollection, type CollectionEntry } from 'astro:content'

/**
 * Get all published posts for a specific project
 * @param projectId - The project ID from projects.yaml (e.g., 'ab-simulator')
 * @returns Array of posts linked to that project, sorted by publish date (newest first)
 */
export async function getPostsByProject(projectId: string): Promise<CollectionEntry<'post'>[]> {
  const allPosts = await getCollection('post', ({ data }) => {
    return !data.draft && data.projectId === projectId
  })
  
  return allPosts.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
}

/**
 * Get all featured posts
 * @returns Array of featured posts, sorted by publish date (newest first)
 */
export async function getFeaturedPosts(): Promise<CollectionEntry<'post'>[]> {
  const allPosts = await getCollection('post', ({ data }) => {
    return !data.draft && data.featured
  })
  
  return allPosts.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
}
