import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and keep in sync the unread inbox message count for the current user.
 * Supports both POSTER and HUSTLER roles.
 *
 * @param {object} currentUser - The logged-in user object (must have id and role)
 * @param {number} refreshTrigger - Optional, increment to force refresh (e.g. after reading messages)
 * @returns {number} unreadCount
 */
export default function useUnreadInboxCount(currentUser, refreshTrigger = 0) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      setUnreadCount(0);
      return;
    }
    let url = '';
    if (currentUser.role === 'POSTER') {
      url = `http://localhost:8080/api/messages/poster-inbox?userId=${currentUser.id}`;
    } else if (currentUser.role === 'HUSTLER') {
      url = `http://localhost:8080/api/messages/inbox?userId=${currentUser.id}`;
    }
    if (!url) return;

    let stopped = false;
    const fetchUnread = () => {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (stopped) return;
          if (Array.isArray(data)) {
            const totalUnread = data.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
            setUnreadCount(totalUnread);
          } else {
            setUnreadCount(0);
          }
        })
        .catch(() => { if (!stopped) setUnreadCount(0); });
    };
    fetchUnread(); // initial fetch
    const interval = setInterval(fetchUnread, 5000); // poll every 5s
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [currentUser, refreshTrigger]);

  return unreadCount;
}
