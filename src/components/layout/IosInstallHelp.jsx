import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { CircleCheck, Share, SquarePlus, X } from 'lucide-react';
import { useModalDialog } from '../../hooks/useModalDialog';

const STEPS = [
  { id: 'share', icon: Share, text: <>Tap the <strong>Share</strong> button in your browser&apos;s toolbar.</> },
  { id: 'add-to-home', icon: SquarePlus, text: <>Scroll down and tap <strong>Add to Home Screen</strong>.</> },
  { id: 'confirm', icon: CircleCheck, text: <>Tap <strong>Add</strong>. Mise now opens from your Home Screen like an app.</> },
];

/**
 * iPhone and iPad can't show an install prompt, so this explains the Share
 * menu instead. Loaded only when someone asks for it.
 */
function IosInstallHelp({ onClose }) {
  const doneRef = useRef(null);
  const dialogRef = useModalDialog(doneRef);

  // Rendered into <body> so it still shows when opened from the mobile menu, which closes behind it.
  return createPortal(
    <dialog
      ref={dialogRef}
      className="modal modal--install"
      aria-labelledby="install-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal__panel install-help">
        <header className="install-help__header">
          <h2 className="install-help__title" id="install-title">
            Install Mise
          </h2>
          <button type="button" className="modal__close modal__close--inline" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <p className="install-help__intro">
          Add Mise to your Home Screen to open it full screen, like an app, with your saved recipes and meal plan.
        </p>
        <ol className="install-help__steps">
          {STEPS.map(({ id, icon: Icon, text }) => (
            <li key={id} className="install-help__step">
              <span className="install-help__icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <button ref={doneRef} type="button" className="btn btn--primary install-help__done" onClick={onClose}>
          Got it
        </button>
      </div>
    </dialog>,
    document.body,
  );
}

export default IosInstallHelp;
