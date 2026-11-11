/** Centered message for empty, idle and error states. */
function StatusMessage({ icon: Icon, title, description, tone = 'neutral', children }) {
  return (
    <div className={`status-message status-message--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      {Icon && (
        <div className="status-message__icon" aria-hidden="true">
          <Icon size={32} />
        </div>
      )}
      <h3 className="status-message__title">{title}</h3>
      {description && <p className="status-message__text">{description}</p>}
      {children && <div className="status-message__actions">{children}</div>}
    </div>
  );
}

export default StatusMessage;
