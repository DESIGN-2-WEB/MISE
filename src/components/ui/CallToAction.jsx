/** A closing banner with a heading, short text and action links. */
function CallToAction({ title, text, children }) {
  return (
    <section className="section" aria-label={title}>
      <div className="container">
        <div className="cta">
          <h2 className="cta__title">{title}</h2>
          {text && <p className="cta__text">{text}</p>}
          <div className="cta__actions">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
