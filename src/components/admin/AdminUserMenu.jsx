function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

function AdminUserMenu({ displayName, avatarUrl, userEmail, onLogout }) {
  const label = displayName && displayName !== userEmail ? displayName : userEmail

  return (
    <div className="admin-user-menu">
      <div className="admin-avatar" aria-hidden="true">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span>{getInitials(label)}</span>
        )}
      </div>

      <div className="admin-user-info">
        {displayName && displayName !== userEmail ? (
          <strong>{displayName}</strong>
        ) : null}
        <span>{userEmail}</span>
      </div>

      {onLogout ? (
        <button type="button" className="button admin-secondary-button" onClick={onLogout}>
          Sair
        </button>
      ) : null}
    </div>
  )
}

export default AdminUserMenu
