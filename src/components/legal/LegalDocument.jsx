import PageHeader from '../layout/PageHeader';
import { LEGAL_LAST_UPDATED } from '../../constants/site';

/** Layout for legal pages: title, last-updated date, table of contents and numbered sections. */
function LegalDocument({ eyebrow, title, intro, sections }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title}>
        <p className="legal__updated">
          Last updated <time dateTime={LEGAL_LAST_UPDATED.iso}>{LEGAL_LAST_UPDATED.label}</time>
        </p>
      </PageHeader>

      <div className="section section--tight">
        <div className="container legal">
          <nav className="legal__toc no-print" aria-labelledby="legal-toc-title">
            <h2 className="legal__toc-title" id="legal-toc-title">
              On this page
            </h2>
            <ol>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal__body prose">
            {intro}
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`}>
                  {index + 1}. {section.title}
                </h2>
                {section.content}
              </section>
            ))}
          </article>
        </div>
      </div>
    </>
  );
}

export default LegalDocument;
