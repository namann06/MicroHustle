import React, { useEffect, useState } from "react";
import { Search, MessageCircle, Clock, Users, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import ModernChatInterface from "./ModernChatInterface";
import '../styles/modern-inbox.css';

export default function ModernPosterInbox({ currentUser, onInboxRead }) {
  const [threads, setThreads] = useState([]);
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'POSTER') return;
    
    fetch(`http://localhost:8080/api/messages/poster-inbox?userId=${currentUser.id}`)
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
        thread.hustlerUsername.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredThreads(filtered);
    }
  }, [searchQuery, threads]);

  const markThreadRead = (taskId, posterId, hustlerId) => {
    return fetch(`http://localhost:8080/api/messages/mark-thread-read?taskId=${taskId}&posterId=${posterId}&hustlerId=${hustlerId}`, {
      method: 'POST'
    });
  };

  const openChat = (thread) => {
    setSelectedThread(thread);
    // Mark all as read for this thread
    markThreadRead(thread.taskId, currentUser.id, thread.hustlerId)
      .then(() => {
        // Update the thread list to remove unread count
        setThreads(prevThreads =>
          prevThreads.map(t =>
            t.taskId === thread.taskId && t.hustlerId === thread.hustlerId
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
      fetch(`http://localhost:8080/api/messages/poster-inbox?userId=${currentUser.id}`)
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

  if (!currentUser || currentUser.role !== 'POSTER') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 text-center">
          <CardContent>
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Login as a poster to see your inbox.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 modern-inbox">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col chat-sidebar">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 glass-header">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {getTotalUnreadCount() > 0 && (
              <Badge variant="default" className="bg-yellow-500">
                {getTotalUnreadCount()}
              </Badge>
            )}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto chat-list-scroll">
          {(!Array.isArray(filteredThreads) || filteredThreads.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No conversations</p>
              <p className="text-sm">Your messages will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredThreads.map(thread => (                  <div
                    key={thread.taskId + '-' + thread.hustlerId}
                    className={`p-4 cursor-pointer transition-colors duration-150 hover:bg-gray-50 chat-transition ${
                      selectedThread && selectedThread.taskId === thread.taskId && selectedThread.hustlerId === thread.hustlerId
                        ? 'bg-yellow-50 border-r-2 border-yellow-500'
                        : ''
                    }`}
                    onClick={() => openChat(thread)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="avatar-gradient-yellow text-white">
                          {getInitials(thread.hustlerUsername)}
                        </AvatarFallback>
                      </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {thread.hustlerUsername}
                        </p>
                        {thread.lastMessageTime && (
                          <p className="text-xs text-gray-500">
                            {formatTime(thread.lastMessageTime)}
                          </p>
                        )}
                      </div>
                      
                      <p className="text-sm text-yellow-600 font-medium truncate mt-1">
                        {thread.taskTitle}
                      </p>
                      
                      {thread.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {thread.lastMessage}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Briefcase className="h-3 w-3" />
                          <span>My Task</span>
                        </div>
                        
                        {thread.unreadCount > 0 && (
                          <Badge variant="default" className="bg-yellow-500 text-white">
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
              id: selectedThread.hustlerId,
              username: selectedThread.hustlerUsername
            }}
            task={{
              id: selectedThread.taskId,
              title: selectedThread.taskTitle
            }}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="relative">
                <MessageCircle className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">💼</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to your inbox
              </h3>
              <p className="text-gray-600 max-w-sm">
                Select a conversation from the sidebar to start chatting with hustlers working on your tasks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
