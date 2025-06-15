import { useEffect, useState } from "react";

export default function useUnreadNotifications(currentUser) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "POSTER") {
      setUnreadCount(0);
      return;
    }
    fetch(`http://localhost:8080/api/notifications/poster/${currentUser.id}?unread=true`)
      .then(res => res.json())
      .then(data => setUnreadCount(Array.isArray(data) ? data.length : 0));
  }, [currentUser]);

  return unreadCount;
}