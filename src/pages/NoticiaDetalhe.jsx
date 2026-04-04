import { PortableText } from '@portabletext/react'
import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import landingConfig from '../config/landingConfig'
import { fetchPostBySlug } from '../utils/news'
import { setBasicSeo } from '../utils/seo'

function formatPublishedDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function NoticiaDetalhe() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchPostBySlug(slug)
      .then((result) => {
        if (!active) {
          return
        }

        setPost(result)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setError(true)
      })
      .finally(() => {
        if (!active) {
          return
        }

        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    if (!post?.title) {
      return
    }

    setBasicSeo({
      title: `${post.title} | ${landingConfig.metadata.brandName}`,
      description: post.excerpt || post.title,
    })
  }, [post])

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Carregando noticia...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section">
        <div className="container section-head">
          <h1>Noticia indisponivel</h1>
          <p>Nao foi possivel carregar esta noticia agora.</p>
          <Link to="/noticias" className="button button-primary">
            Voltar para noticias
          </Link>
        </div>
      </section>
    )
  }

  if (!post) {
    return <Navigate to="/noticias" replace />
  }

  return (
    <section className="section">
      <div className="container news-detail">
        <article className="thematic-panel">
          <small>
            {formatPublishedDate(post.publishedAt)}
            {post.author ? ` | ${post.author}` : ''}
          </small>
          <h1>{post.title}</h1>
          {post.imageUrl ? <img src={post.imageUrl} alt={post.title} className="news-detail-image" /> : null}
          {post.excerpt ? <p>{post.excerpt}</p> : null}

          {post.content?.length ? (
            <div className="portable-content">
              <PortableText value={post.content} />
            </div>
          ) : post.contentHtml ? (
            <div
              className="portable-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.contentHtml) }}
            />
          ) : null}

          <Link to="/noticias" className="inline-link">
            Voltar para todas as noticias
          </Link>
        </article>
      </div>
    </section>
  )
}

export default NoticiaDetalhe
