function InfoSection({ title, text, image }) {
  return (
    <section className="content-section">
      <div className="container content-grid">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>

        <img src={image} alt={title} className="content-image" />
      </div>
    </section>
  )
}

export default InfoSection