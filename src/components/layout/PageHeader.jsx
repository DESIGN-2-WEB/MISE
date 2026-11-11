/** The top of an inner page: eyebrow, the page's single <h1>, intro and optional actions. */
function PageHeader({ eyebrow, title, description, children, align = 'center' }) {
  return (
    <header className={`page-header page-header--${align}`}>
      <div className="container page-header__inner">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
        {children}
      </div>
    </header>
  );
}

export default PageHeader;
