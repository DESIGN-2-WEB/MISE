import { Suspense, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLocation } from '../../router/context';
import { matchRoute } from '../../routes';
import { applyHeadTags, getHeadTags } from '../../seo/head';
import StatusMessage from '../ui/StatusMessage';
import ErrorBoundary from './ErrorBoundary';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

function PageError() {
  return (
    <div className="container section">
      <StatusMessage
        icon={AlertTriangle}
        tone="error"
        title="This page couldn't be loaded"
        description="Check your connection and try again."
      >
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </StatusMessage>
    </div>
  );
}

function AppLayout() {
  const { pathname, key, action, hash } = useLocation();
  const route = matchRoute(pathname);
  const Page = route.page;

  useEffect(() => {
    applyHeadTags(getHeadTags(route.id));
  }, [route.id]);

  // After moving to a new page, start keyboard and screen reader users at its content.
  useEffect(() => {
    if (action !== 'push' && action !== 'replace') return;
    if (!hash) document.getElementById('main')?.focus({ preventScroll: true });
  }, [key, action, hash]);

  // The entrance page is a single welcome screen, shown without the site chrome.
  const isEntrance = route.id === 'home';

  return (
    <>
      {!isEntrance && (
        <a href="#main" className="skip-link">
          Skip to content
        </a>
      )}
      {!isEntrance && <SiteHeader />}
      <main id="main" tabIndex={-1}>
        <ErrorBoundary key={key} fallback={<PageError />}>
          <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
            <Page key={key} />
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isEntrance && <SiteFooter />}
    </>
  );
}

export default AppLayout;
