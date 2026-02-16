import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function useUnreadNotifications(currentUser) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "POSTER") {
      setUnreadCount(0);
      return;
    }
    const controller = new AbortController();
    const loadUnread = async () => {
      try {
        const res = await apiFetch(
          `/api/notifications/poster/${currentUser.id}?unread=true`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setUnreadCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to fetch unread notifications", error);
        setUnreadCount(0);
      }
    };
    loadUnread();
    return () => controller.abort();
  }, [currentUser]);

  return unreadCount;
}