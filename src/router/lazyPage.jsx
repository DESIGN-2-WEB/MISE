import { use } from 'react';

/**
 * Like React.lazy, but the page can be loaded ahead of time with `Page.load()`.
 * Once loaded it renders synchronously, so a prerendered page is never
 * replaced by a loading state while the app starts.
 */
export function lazyPage(loader) {
  let Component = null;
  let promise = null;

  const load = () => {
    promise ??= loader().then((module) => {
      Component = module.default;
      return Component;
    });
    return promise;
  };

  function LazyPage(props) {
    if (!Component) use(load());
    return <Component {...props} />;
  }

  LazyPage.load = load;
  return LazyPage;
}
