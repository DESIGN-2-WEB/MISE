import AppLayout from './components/layout/AppLayout';
import KitchenProvider from './context/KitchenProvider';
import RouterProvider from './router/RouterProvider';

/** `url` is only passed when prerendering; in the browser the router reads the address bar. */
function App({ url }) {
  return (
    <RouterProvider url={url}>
      <KitchenProvider>
        <AppLayout />
      </KitchenProvider>
    </RouterProvider>
  );
}

export default App;
