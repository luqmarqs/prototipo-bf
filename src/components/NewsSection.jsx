import { Link } from 'react-router-dom'

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

function NewsSection({ title, intro, posts, loading, error, showMoreLink = false }) {
  if (loading) {
    return (
      <section className="section news-section" aria-label="Noticias">
        <div className="container">
          <div className="section-head">
            <h2>{title}</h2>
            <p>{intro}</p>
          </div>
          <p className="news-feedback">Carregando noticias...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section news-section" aria-label="Noticias">
        <div className="container">
          <div className="section-head">
            <h2>{title}</h2>
            <p>{intro}</p>
          </div>
          <p className="news-feedback">Nao foi possivel carregar as noticias agora.</p>
        </div>
      </section>
    )
  }

  if (!posts.length) {
    return (
      <section className="section news-section" aria-label="Noticias">
        <div className="container">
          <div className="section-head">
            <h2>{title}</h2>
            <p>{intro}</p>
          </div>
          <p className="news-feedback">Nenhuma noticia publicada no momento.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section news-section" aria-label="Noticias">
      <div className="container">
        <div className="section-head">
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>

        <div className="news-grid">
          {posts.map((post) => {
            const publishedDate = formatPublishedDate(post.publishedAt)

            return (
              <Link key={post.id} to={`/noticias/${post.slug}`} className="news-card news-card-link">
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="news-image"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}

                <div className="news-card-content">
                  <small>
                    {publishedDate}
                    {post.author ? ` | ${post.author}` : ''}
                  </small>
                  <h3>{post.title}</h3>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                </div>
              </Link>
            )
          })}
        </div>

        {showMoreLink ? (
          <div className="news-actions">
            <Link to="/noticias" className="button button-primary">
              Ver mais noticias
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default NewsSection
