import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './PresenceBar.css';

export default function PresenceBar() {
  const { activeUsers } = useSelector((state: RootState) => state.collaboration);
  const currentUserId = 'anonymous';

  if (!activeUsers || activeUsers.length === 0) {
    return null;
  }

  const otherUsers = activeUsers.filter((u) => u.id !== currentUserId);

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="presence-bar">
      <div className="presence-label">Editing with:</div>
      <div className="presence-avatars">
        {otherUsers.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="presence-avatar"
            title={user.username}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {otherUsers.length > 3 && (
          <div className="presence-more">+{otherUsers.length - 3}</div>
        )}
      </div>
    </div>
  );
}
