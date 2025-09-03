import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowlancer.app'
  
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    // Get all public profiles for sitemap
    // Note: This is a placeholder - in production you'd want to implement
    // a more efficient way to get all public profile slugs
    const publicProfiles: MetadataRoute.Sitemap = []
    
    // Get all public projects for sitemap  
    const publicProjects: MetadataRoute.Sitemap = []

    return [...staticRoutes, ...publicProfiles, ...publicProjects]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticRoutes
  }
}
