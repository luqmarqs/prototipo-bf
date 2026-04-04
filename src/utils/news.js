import sanityClient from './sanityClient'

const NEWS_LIST_QUERY = `*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc)[$offset...$end]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  author,
  publishedAt,
  "imageUrl": coalesce(mainImage.asset->url, mainImageUrl)
}`

const NEWS_COUNT_QUERY = `count(*[_type == "post"])`

const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  excerpt,
  author,
  publishedAt,
  "slug": slug.current,
  "imageUrl": coalesce(mainImage.asset->url, mainImageUrl),
  content,
  contentHtml
}`

export async function fetchLatestNews(limit = 3) {
  const page = await fetchNewsPage({ offset: 0, limit })
  return page.items
}

export async function fetchNewsPage({ offset = 0, limit = 6 } = {}) {
  const end = offset + limit
  const [posts, total] = await Promise.all([
    sanityClient.fetch(NEWS_LIST_QUERY, { offset, end }),
    sanityClient.fetch(NEWS_COUNT_QUERY),
  ])

  return {
    total,
    items: posts
      .filter((post) => post.slug)
      .map((post) => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        author: post.author,
        imageUrl: post.imageUrl,
        publishedAt: post.publishedAt,
      })),
  }
}

export async function fetchPostBySlug(slug) {
  if (!slug) {
    return null
  }

  return sanityClient.fetch(POST_BY_SLUG_QUERY, { slug })
}
