export default function PolicyPage({ title, updated, intro, sections }) {
  return <article className="policy-page">
    <header className="policy-hero">
      <span className="eyebrow">DORKAR · BANGLADESH</span>
      <h1>{title}</h1>
      <p className="policy-updated">Last updated {updated}</p>
      <p className="policy-intro">{intro}</p>
    </header>

    <section className="policy-content" aria-label={title}>
      {sections.map((section, index) => <section className="policy-section" id={`policy-section-${index+1}`} key={section.title}><span className="policy-section-number">{String(index+1).padStart(2,'0')}</span><div><h2>{section.title}</h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div></section>)}
    </section>
  </article>
}
