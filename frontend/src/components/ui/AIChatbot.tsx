"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Send, X, Bot, User, MessageCircle, Minimize2, Maximize2, Expand, Shrink, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const branding: Record<string, { bg: string; button: string; accent: string; border: string }> = {
  applicant: { bg: 'bg-blue-600', button: 'bg-blue-600 hover:bg-blue-700', accent: 'bg-blue-500', border: 'border-blue-200' },
  recruiter: { bg: 'bg-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700', accent: 'bg-emerald-500', border: 'border-emerald-200' },
  admin: { bg: 'bg-purple-600', button: 'bg-purple-600 hover:bg-purple-700', accent: 'bg-purple-500', border: 'border-purple-200' },
  guest: { bg: 'bg-amber-600', button: 'bg-amber-600 hover:bg-amber-700', accent: 'bg-amber-500', border: 'border-amber-200' }
};

interface AIChatbotProps {
  isGuest?: boolean;
}

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMessageContent(content: string, colorClass: string = 'bg-blue-600'): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    let trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={lineIndex} className="h-2" />);
      return;
    }
    
    // Remove ## from start and format as header
    if (trimmed.startsWith('## ')) {
      const headerText = trimmed.slice(3).trim();
      elements.push(
        <div key={lineIndex} className="mt-3 mb-1 pb-1 border-b border-slate-200">
          <h4 className="font-bold text-sm sm:text-base text-slate-800">{headerText}</h4>
        </div>
      );
      return;
    }
    
    // Remove # from start
    if (trimmed.startsWith('# ')) {
      trimmed = trimmed.slice(2).trim();
    }
    
    // Bold **text**
    let lastIndex = 0;
    let keyOffset = lineIndex * 1000;
    const boldRegex = /\*\*(.+?)\*\*/g;
    const segments: Array<{text: string; isBold: boolean}> = [];
    let match;
    
    while ((match = boldRegex.exec(trimmed)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: trimmed.slice(lastIndex, match.index), isBold: false });
      }
      segments.push({ text: match[1], isBold: true });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < trimmed.length) {
      segments.push({ text: trimmed.slice(lastIndex), isBold: false });
    }
    
    if (segments.length > 0 && segments.some(s => s.isBold)) {
      elements.push(
        <p key={lineIndex} className="text-[11px] sm:text-sm leading-relaxed text-slate-700 mb-1">
          {segments.map((seg, i) => (
            seg.isBold ? <strong key={keyOffset + i} className="font-bold text-slate-900">{seg.text}</strong> : <span key={keyOffset + i}>{seg.text}</span>
          ))}
        </p>
      );
      return;
    }
    
    // Numbered lists 1. 2. 3.
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={lineIndex} className="flex gap-2 mb-1 ml-2">
          <span className={`flex-shrink-0 w-5 h-5 rounded-full ${colorClass} text-white text-[10px] flex items-center justify-center font-bold`}>
            {numberedMatch[1]}
          </span>
          <span className="text-[11px] sm:text-sm text-slate-700">{numberedMatch[2]}</span>
        </div>
      );
      return;
    }
    
    // Bullet points - or •
    const bulletMatch = trimmed.match(/^[-•]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={lineIndex} className="flex gap-2 mb-1 ml-3">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
          <span className="text-[11px] sm:text-sm text-slate-700">{bulletMatch[1]}</span>
        </div>
      );
      return;
    }
    
    // Default
    elements.push(<p key={lineIndex} className="text-[11px] sm:text-sm leading-relaxed text-slate-700 mb-1">{trimmed}</p>);
  });
  
  return <>{elements}</>;
}

export default function AIChatbot({ isGuest = false }: AIChatbotProps) {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userRole = isGuest ? 'guest' : (user?.role || 'applicant');
  const theme = branding[userRole] || branding.applicant;
  const userName = isGuest ? guestName : (user?.fullName?.split(' ')[0] || user?.fullName || 'User');
  const userFullName = isGuest ? guestName : (user?.fullName || 'User');
  const userAvatar = user?.avatar;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg: Message = {
        id: '1', role: 'assistant', content: isGuest 
          ? `Hi! I'm your Umurava Career Guide. What's your name?` 
          : `Hi${userName !== 'User' ? ' ' + userName : ''}! I'm your Umurava AI assistant. How can I help you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
      if (isGuest && !guestName) setShowNamePrompt(true);
    }
  }, [isOpen, isGuest, userName, guestName, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    try {
      const endpoint = isGuest ? `${process.env.NEXT_PUBLIC_API_URL}/api/ai/guest` : `${process.env.NEXT_PUBLIC_API_URL}/api/ai/assistant`;
      const body = isGuest ? JSON.stringify({ message: text, name: guestName || 'Guest' }) : JSON.stringify({ message: text });
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && !isGuest ? { 'Authorization': `Bearer ${token}` } : {}) },
        body
      });
      
      const data = await res.json();
      if (data.success) {
        const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.data.response, timestamp: new Date() };
        setMessages(prev => [...prev, botMsg]);
        if (isGuest && data.data.userName && !guestName) { setGuestName(data.data.userName); setShowNamePrompt(false); }
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, please try again.', timestamp: new Date() }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, something went wrong.', timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showNamePrompt && guestName.trim()) {
      setMessages(prev => [prev[0], { id: '2', role: 'assistant', content: `Great! ${guestName}, what would you like to know?`, timestamp: new Date() }]);
      setShowNamePrompt(false);
      return;
    }
    sendMessage(input);
  };

  const handleOverlayClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget) setIsOpen(false); };

  const getChatDimensions = () => {
    if (isMaximized) return 'w-[95vw] h-[85vh] max-w-4xl';
    if (isMinimized) return 'h-14 w-64';
    return 'w-72 sm:w-80 lg:w-96 h-[420px] sm:h-[480px]';
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          className={`w-12 h-12 rounded-full ${theme.button} shadow-xl flex items-center justify-center cursor-pointer transition-all`}
          onClick={() => setIsOpen(true)} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}
          style={{ display: isOpen ? 'none' : 'flex' }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.button>
        
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-14 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
            >
              Chat with us
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40" onClick={handleOverlayClick} />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className={`fixed z-50 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border ${theme.border} ${getChatDimensions()} ${isMaximized ? 'top-4 left-4 right-4 bottom-4' : 'bottom-20 right-4'}`}
              style={{ transition: 'all 0.3s ease' }}
            >
              {/* Header */}
              <div className={`${theme.bg} px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-lg flex-shrink-0`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xs sm:text-sm leading-tight">Umurava AI Assistant</h3>
                    <p className="text-white/70 text-[8px] sm:text-[10px]">Platform Support</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {!isMinimized && (
                    <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 rounded hover:bg-white/20 transition-colors hidden sm:flex">
                      {isMaximized ? <Shrink className="w-3.5 h-3.5 text-white" /> : <Expand className="w-3.5 h-3.5 text-white" />}
                    </button>
                  )}
                  <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded hover:bg-white/20 transition-colors">
                    {isMinimized ? <Maximize2 className="w-3.5 h-3.5 text-white" /> : <Minimize2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 rounded hover:bg-white/20 transition-colors">
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-3 bg-gradient-to-b from-slate-50 to-slate-100">
                    {messages.map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm
                            ${msg.role === 'user' ? theme.bg + ' text-white' : 'bg-gradient-to-br from-slate-700 to-slate-900 text-white'}`}>
                            {msg.role === 'user' ? (
                              userAvatar ? <Image src={userAvatar} alt={userFullName} fill className="rounded-full object-cover" /> : getInitials(userFullName)
                            ) : <Bot className="w-4 h-4" />}
                          </div>
                          
                          {/* Bubble */}
                          <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm max-w-[85%] ${msg.role === 'user' ? `${theme.bg} text-white rounded-tr-sm` : 'bg-white border border-slate-200 rounded-tl-sm'}`}>
                            {msg.role === 'user' ? (
                              <span className="text-[11px] sm:text-sm">{msg.content}</span>
                            ) : (
                              <div className="text-[11px] sm:text-sm leading-relaxed">
                                {formatMessageContent(msg.content, theme.bg.replace('bg-', 'bg-'))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {msg.timestamp && (
                          <span className={`text-[9px] sm:text-[10px] text-slate-400 mt-1 ${msg.role === 'user' ? 'self-end mr-10' : 'self-start ml-10'}`}>
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </motion.div>
                    ))}
                    
                    {isLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="p-3 rounded-2xl bg-white border border-slate-200">
                            <div className="flex gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1.5 ml-10">typing...</span>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  {showNamePrompt ? (
                    <form onSubmit={handleSubmit} className="p-2 sm:p-3 border-t border-slate-200 bg-white flex-shrink-0">
                      <div className="flex gap-2">
                        <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Your name..." 
                          className="flex-1 px-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500" />
                        <button type="submit" disabled={!guestName.trim()} className={`p-2 sm:p-2.5 rounded-xl ${theme.bg} text-white disabled:opacity-50`}>
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmit} className="p-2 sm:p-3 border-t border-slate-200 bg-white flex-shrink-0">
                      <div className="flex gap-2">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                          placeholder="Type your message..." disabled={isLoading}
                          className="flex-1 px-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 disabled:opacity-50" />
                        <button type="submit" disabled={isLoading || !input.trim()} className={`p-2 sm:p-2.5 rounded-xl ${theme.bg} text-white disabled:opacity-50`}>
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}