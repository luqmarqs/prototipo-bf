import sanityClient from './sanityClient'

const CAMPAIGNS_QUERY = `*[_type == "campaign" && coalesce(active, true) == true] | order(coalesce(_updatedAt, _createdAt) desc)[0...$limit]{
  _id,
  title,
  "slug": slug.current,
  "type": coalesce(form.campaignTag, "campanha"),
  "description": coalesce(hero.text, contentSection.title, description, title),
  "imageUrl": coalesce(hero.image.asset->url, image.asset->url),
  "ctaLabel": coalesce(cta.ctaText, cta.whatsappButtonText, ctaLabel, "Ver landing")
}`

const CAMPAIGN_BY_SLUG_QUERY = `*[_type == "campaign" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  "active": coalesce(active, true),
  "hero": {
    "title": coalesce(hero.title, title),
    "text": coalesce(hero.text, description),
    "imageUrl": coalesce(hero.image.asset->url, image.asset->url)
  },
  "cta": {
    "ctaText": coalesce(cta.ctaText, ctaLabel, "Quero apoiar"),
    "whatsappButtonText": coalesce(cta.whatsappButtonText, "Compartilhar no WhatsApp"),
    "whatsappText": coalesce(cta.whatsappText, "Conheca esta campanha")
  },
  "contentSection": {
    "title": contentSection.title,
    "imageUrl": coalesce(contentSection.image.asset->url, image.asset->url),
    "content": coalesce(contentSection.content, content)
  },
  "form": {
    "campaignTag": coalesce(form.campaignTag, "campanha"),
    "title": coalesce(form.title, "Quero apoiar")
  }
}`

export async function fetchActiveCampaigns(limit = 6) {
  try {
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
  } catch {
    return []
  }
}

export async function fetchCampaignBySlug(slug) {
  if (!slug) {
    return null
  }

  try {
    return await sanityClient.fetch(CAMPAIGN_BY_SLUG_QUERY, { slug })
  } catch {
    return null
  }
}
