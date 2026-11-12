import { lazy, Suspense, useState } from 'react';
import { Download } from 'lucide-react';
import { useInstallState } from '../../hooks/useInstallState';
import { promptInstall } from '../../utils/pwa';

// Only iPhone and iPad visitors who tap the button need the instructions.
const IosInstallHelp = lazy(() => import('./IosInstallHelp'));

/**
 * "Install app": opens the browser's install prompt, or on iPhone and iPad
 * shows how to add Mise to the Home Screen. Renders nothing where the site
 * can't be installed or is already running as an app.
 */
function InstallAppButton({ className, iconSize = 16, children = 'Install app' }) {
  const state = useInstallState();
  const [showIosHelp, setShowIosHelp] = useState(false);
  const canInstall = state === 'prompt' || state === 'ios';

  if (!canInstall && !showIosHelp) return null;

  const handleClick = () => {
    if (state === 'prompt') promptInstall().catch(() => {});
    else setShowIosHelp(true);
  };

  return (
    <>
      {canInstall && (
        <button type="button" className={className} onClick={handleClick}>
          <Download size={iconSize} aria-hidden="true" />
          {children}
        </button>
      )}
      {showIosHelp && (
        <Suspense fallback={null}>
          <IosInstallHelp onClose={() => setShowIosHelp(false)} />
        </Suspense>
      )}
    </>
  );
}

export default InstallAppButton;
