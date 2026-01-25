import React, { useEffect, useState } from "react";
import { Search, MessageCircle, Clock, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import ModernChatInterface from "./ModernChatInterface";
import '../styles/modern-inbox.css';

export default function ModernHustlerInbox({ currentUser, onInboxRead }) {
  const [threads, setThreads] = useState([]);
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'HUSTLER') return;
    
    fetch(`http://localhost:8080/api/messages/inbox?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setThreads(data);
          setFilteredThreads(data);
        } else {
          setThreads([]);
          setFilteredThreads([]);
        }
      });
  }, [currentUser]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredThreads(threads);
    } else {
      const filtered = threads.filter(thread =>
        thread.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.posterUsername.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredThreads(filtered);
    }
  }, [searchQuery, threads]);

  const markThreadReadHustler = (taskId, posterId, hustlerId) => {
    return fetch(`http://localhost:8080/api/messages/mark-thread-read-hustler?taskId=${taskId}&posterId=${posterId}&hustlerId=${hustlerId}`, {
      method: 'POST'
    });
  };

  const openChat = (thread) => {
    setSelectedThread(thread);
    // Mark all as read for this thread for hustler
    markThreadReadHustler(thread.taskId, thread.posterId, currentUser.id)
      .then(() => {
        // Update the thread list to remove unread count
        setThreads(prevThreads =>
          prevThreads.map(t =>
            t.taskId === thread.taskId && t.posterId === thread.posterId
              ? { ...t, unreadCount: 0 }
              : t
          )
        );
      });
  };

  const handleCloseChat = () => {
    setSelectedThread(null);
    // Refresh inbox
    if (currentUser) {
      fetch(`http://localhost:8080/api/messages/inbox?userId=${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setThreads(data);
            setFilteredThreads(data);
          }
          if (typeof onInboxRead === 'function') onInboxRead();
        });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getInitials = (username) => {
    return username ? username.substring(0, 2).toUpperCase() : "U";
  };

  const getTotalUnreadCount = () => {
    return filteredThreads.reduce((total, thread) => total + (thread.unreadCount || 0), 0);
  };

  if (!currentUser || currentUser.role !== 'HUSTLER') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 text-center">
          <CardContent>
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Login as a hustler to see your inbox.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 modern-inbox">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-r border-indigo-900/50 flex flex-col chat-sidebar">
        {/* Header */}
        <div className="p-6 border-b border-indigo-900/50 bg-gradient-to-r from-gray-900/90 to-indigo-950/90">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            {getTotalUnreadCount() > 0 && (
              <Badge variant="default" className="bg-indigo-800 hover:bg-indigo-700">
                {getTotalUnreadCount()}
              </Badge>
            )}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/80 border-indigo-800/50 text-white placeholder:text-indigo-400 focus:border-indigo-700 focus:ring-indigo-700"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto chat-list-scroll">
          {(!Array.isArray(filteredThreads) || filteredThreads.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-indigo-400">
              <MessageCircle className="h-12 w-12 mb-4 text-indigo-500" />
              <p className="text-lg font-medium">No conversations</p>
              <p className="text-sm">Your messages will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-indigo-900/30">
              {filteredThreads.map(thread => (                  <div
                    key={thread.taskId + '-' + thread.posterId}
                    className={`p-4 cursor-pointer transition-colors duration-150 hover:bg-indigo-950/50 chat-transition ${
                      selectedThread && selectedThread.taskId === thread.taskId && selectedThread.posterId === thread.posterId
                        ? 'bg-indigo-900/50 border-r-2 border-indigo-700'
                        : ''
                    }`}
                    onClick={() => openChat(thread)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-indigo-800 text-white">
                          {getInitials(thread.posterUsername)}
                        </AvatarFallback>
                      </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white truncate">
                          {thread.posterUsername}
                        </p>
                        {thread.lastMessageTime && (
                          <p className="text-xs text-indigo-400">
                            {formatTime(thread.lastMessageTime)}
                          </p>
                        )}
                      </div>
                      
                      <p className="text-sm text-indigo-500 font-medium truncate mt-1">
                        {thread.taskTitle}
                      </p>
                      
                      {thread.lastMessage && (
                        <p className="text-sm text-gray-300 truncate mt-1">
                          {thread.lastMessage}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1 text-xs text-indigo-400">
                          <Users className="h-3 w-3" />
                          <span>Task Chat</span>
                        </div>
                        
                        {thread.unreadCount > 0 && (
                          <Badge variant="default" className="bg-indigo-800 text-white hover:bg-indigo-700">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col chat-main">
        {selectedThread ? (
          <ModernChatInterface
            currentUser={currentUser}
            otherUser={{
              id: selectedThread.posterId,
              username: selectedThread.posterUsername
            }}
            task={{
              id: selectedThread.taskId,
              title: selectedThread.taskTitle
            }}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-950">
            <div className="text-center">
              <div className="relative">
                <MessageCircle className="h-20 w-20 text-indigo-400 mx-auto mb-4" />
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-indigo-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">💬</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to your inbox
              </h3>
              <p className="text-indigo-300 max-w-sm">
                Select a conversation from the sidebar to start chatting with task posters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
