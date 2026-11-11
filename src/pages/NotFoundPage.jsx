import { Link } from '../router/Link';

function NotFoundPage() {
  return (
    <section className="section not-found">
      <div className="container not-found__inner">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1 className="not-found__title">We couldn&apos;t find that page</h1>
        <p className="not-found__text">It may have moved, or the link might be mistyped.</p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--primary">
            Go to the home page
          </Link>
          <Link to="/recipes" className="btn btn--ghost">
            Browse recipes
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
