import React from 'react';
import NavBar from './NavBar';

export default function Layout({ children, currentUser, onLogout, setPage, unreadNotificationCount, unreadInboxCount }) {
  return (
    <div>
      <NavBar
        currentUser={currentUser}
        onLogout={onLogout}
        setPage={setPage}
        unreadNotificationCount={unreadNotificationCount}
        unreadInboxCount={unreadInboxCount}
      />
      <main>{children}</main>
    </div>
  );
}
