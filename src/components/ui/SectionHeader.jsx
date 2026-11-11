function SectionHeader({ id, badge, badgeIcon: BadgeIcon, title, subtitle, action }) {
  return (
    <header className="section-header">
      <div className="section-header__text">
        {badge && (
          <p className="section-badge">
            {BadgeIcon && <BadgeIcon size={14} aria-hidden="true" />}
            {badge}
          </p>
        )}
        <h2 className="section-title" id={id}>
          {title}
        </h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="section-header__action">{action}</div>}
    </header>
  );
}

export default SectionHeader;
