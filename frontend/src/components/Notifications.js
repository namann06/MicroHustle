import React, { useEffect, useState, useRef } from "react";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion } from "framer-motion";
import ChatModal from './ChatModal';
import StarRating from './StarRating';
import { cn } from "../lib/utils";
import { Bell, CheckCircle, MessageCircle, Clock, User } from "lucide-react";
import { apiFetch, buildUrl } from "../lib/api";

function Notifications({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProps, setChatProps] = useState(null);
  const [hustlerRatings, setHustlerRatings] = useState({});
  const [loadError, setLoadError] = useState(null);
  // Fetch initial unread notifications
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'POSTER') return;
    let cancelled = false;
    const fetchNotifications = async () => {
      try {
  const res = await apiFetch(`/api/notifications/poster/${currentUser.id}?unread=true`);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setNotifications(data);
          setLoadError(null);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
        if (!cancelled) {
          setNotifications([]);
          setLoadError("Couldn't reach the notification service. Please refresh once the server is available.");
        }
      }
    };
    fetchNotifications();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Fetch hustler ratings for notifications
  useEffect(() => {
    let cancelled = false;
    const uniqueHustlerIds = Array.from(new Set(notifications.map(n => n.hustlerId).filter(Boolean)));
    uniqueHustlerIds.forEach(hustlerId => {
      if (cancelled) return;
      (async () => {
        try {
            const res = await apiFetch(`/api/ratings/hustler/${hustlerId}/average`);
          if (!res.ok) {
            throw new Error(`Failed to fetch rating for ${hustlerId}: ${res.status}`);
          }
          const avg = await res.json();
          if (!cancelled) {
            setHustlerRatings(prev => (
              prev[hustlerId] !== undefined ? prev : { ...prev, [hustlerId]: avg }
            ));
          }
        } catch (error) {
          console.error("Failed to fetch hustler rating", error);
          if (!cancelled) {
            setHustlerRatings(prev => (
              prev[hustlerId] !== undefined ? prev : { ...prev, [hustlerId]: null }
            ));
          }
        }
      })();
    });
    return () => {
      cancelled = true;
    };
  }, [notifications]);

  // WebSocket for real-time notifications
  const stompClientRef = useRef(null);
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'POSTER') return;
  const socket = new SockJS(buildUrl(`/ws/notifications`));
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/notifications/${currentUser.id}`, (message) => {
          const notif = JSON.parse(message.body);
          setNotifications(prev => [notif, ...prev]);
        });
      },
    });
    stompClient.activate();
    stompClientRef.current = stompClient;
    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [currentUser]);

  const markAsRead = async (id) => {
    try {
  const res = await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (!res.ok) {
        throw new Error(`Failed to mark notification ${id} as read (status ${res.status})`);
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  if (!currentUser || currentUser.role !== 'POSTER') {
    return (
      <div className="relative w-full">
        <div className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">
          <div
            className={cn(
              "absolute inset-0",
              "[background-size:40px_40px]",
              "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
              "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
            )} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 w-full max-w-md p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-3xl border border-neutral-200 bg-neutral-100/80 backdrop-blur-sm p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/80"
            >
              <div className="text-center">
                <Bell className="w-16 h-16 mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Restricted</h2>
                <p className="text-neutral-600 dark:text-neutral-400">Please login as a poster to view notifications.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }


  const openChat = (notif) => {
    setChatProps({
      currentUser,
      otherUser: { id: notif.hustlerId, username: notif.hustlerUsername },
      task: { id: notif.taskId, title: notif.taskTitle }
    });
    setChatOpen(true);
  };

  return (
    <div className="relative w-full">
      {/* Grid Background */}
      <div className="relative min-h-screen w-full bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )} />
        {/* Radial gradient for the container to give a faded look */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
        
        {/* Notifications Content */}
        <div className="relative z-20 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-3xl border border-neutral-200 bg-neutral-100/80 backdrop-blur-sm p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/80 mb-8"
            >
              <div className="flex items-center gap-4 mb-2">
                <Bell className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                  Task Updates
                </h1>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Stay updated with the latest activity on your posted tasks
              </p>
            </motion.div>

            {/* Notifications List */}
            {loadError ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-3xl border border-red-200 bg-red-50/90 backdrop-blur-sm p-12 shadow-xl text-center dark:border-red-800/60 dark:bg-red-900/40"
              >
                <Bell className="w-20 h-20 mx-auto text-red-300 dark:text-red-600 mb-6" />
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                  Unable to load notifications
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  {loadError}
                </p>
              </motion.div>
            ) : notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-3xl border border-neutral-200 bg-neutral-100/80 backdrop-blur-sm p-12 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/80 text-center"
              >
                <Bell className="w-20 h-20 mx-auto text-neutral-300 dark:text-neutral-600 mb-6" />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  No notifications yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  You'll see updates here when hustlers interact with your tasks
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="rounded-2xl border border-neutral-200 bg-neutral-100/80 backdrop-blur-sm p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/80 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Task Title */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            {notification.taskTitle || `Task ID: ${notification.taskId}`}
                          </h3>
                        </div>

                        {/* Hustler Info */}
                        <div className="flex items-center gap-3 mb-4">
                          <User className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                            Accepted by: {notification.hustlerUsername || `ID: ${notification.hustlerId}`}
                          </span>
                          {notification.hustlerId && (
                            <div className="flex items-center gap-2">
                              <StarRating value={hustlerRatings[notification.hustlerId]} />
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => markAsRead(notification.id)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Read
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openChat(notification)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && chatProps && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          {...chatProps}
        />
      )}
    </div>
  );
}

export default Notifications;