function NarrativeSection({ title, biography, personalStory, causes }) {
  return (
    <section className="section">
      <div className="container narrative-layout">
        <div className="narrative-main">
          <h1>{title}</h1>
          <p>{biography}</p>
          <p>{personalStory}</p>
        </div>

        <aside className="narrative-aside">
          <h2>Causas defendidas</h2>
          <ul>
            {causes.map((cause) => (
              <li key={cause}>{cause}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}

export default NarrativeSection
