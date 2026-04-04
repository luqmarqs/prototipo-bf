import { createClient } from '@sanity/client'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '4z8utkvy'
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2026-04-04',
  useCdn: true,
})

export default sanityClient
