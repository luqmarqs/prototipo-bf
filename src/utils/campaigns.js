import sanityClient from './sanityClient'

const CAMPAIGNS_QUERY = `*[_type == "campaign" && coalesce(active, true) == true] | order(coalesce(_updatedAt, _createdAt) desc)[0...$limit]{
  _id,
  title,
  "slug": slug.current,
  "type": coalesce(form.campaignTag, "campanha"),
  "description": coalesce(hero.text, contentSection.title, title),
  "imageUrl": hero.image.asset->url,
  "ctaLabel": coalesce(cta.ctaText, cta.whatsappButtonText, "Ver landing")
}`

const CAMPAIGN_BY_SLUG_QUERY = `*[_type == "campaign" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  "active": coalesce(active, true),
  hero{
    title,
    text,
    "imageUrl": image.asset->url
  },
  cta{
    ctaText,
    whatsappButtonText,
    whatsappText
  },
  contentSection{
    title,
    "imageUrl": image.asset->url,
    content
  },
  form{
    campaignTag,
    title
  }
}`

export async function fetchActiveCampaigns(limit = 6) {
  const campaigns = await sanityClient.fetch(CAMPAIGNS_QUERY, { limit })

  return campaigns
    .filter((campaign) => campaign.slug)
    .map((campaign) => ({
      id: campaign._id,
      slug: campaign.slug,
      type: campaign.type,
      title: campaign.title,
      description: campaign.description,
      imageUrl: campaign.imageUrl,
      ctaLabel: campaign.ctaLabel,
    }))
}

export async function fetchCampaignBySlug(slug) {
  if (!slug) {
    return null
  }

  return sanityClient.fetch(CAMPAIGN_BY_SLUG_QUERY, { slug })
}
