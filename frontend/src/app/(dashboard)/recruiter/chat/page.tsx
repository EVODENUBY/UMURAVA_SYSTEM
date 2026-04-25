"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api, ENDPOINTS } from '@/lib/api';
import { FaRobot, FaUser, FaTrash, FaTimes, FaCheck, FaStar, FaChartLine, FaUsers, FaQuestionCircle, FaChevronRight, FaLightbulb, FaFileAlt, FaSearch } from 'react-icons/fa';
import { Send, Sparkles } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
}

interface CandidateInfo {
  name: string;
  email: string;
  score: number;
  rank?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  structuredData?: {
    type: 'candidates' | 'stats' | 'questions' | 'analysis' | 'recommendation';
    data: any;
  };
}

interface ChatSession {
  _id: string;
  title: string;
  jobId?: { _id: string; title: string };
  updatedAt?: string;
}

const quickQuestions = [
  'Who are the top 5 candidates?',
  'What skills are most common?',
  'Suggest interview questions',
  'Analyze job requirements',
  'Explain hiring decisions',
];

export default function ChatPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages || []);
    } else {
      setMessages([]);
    }
  }, [currentSession]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchJobs();
    fetchChats();
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { jobs: Job[] } }>(ENDPOINTS.JOBS.ALL, token || undefined);
      if (response.success && response.data.jobs.length > 0) {
        setJobs(response.data.jobs);
        setSelectedJob(response.data.jobs[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await api.get<{ success: boolean; data: ChatSession[] }>('/api/chat', token || undefined);
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await api.post<{ success: boolean; data: ChatSession }>(
        '/chat',
        { title: `Chat ${new Date().toLocaleString()}` },
        token || undefined
      );
      if (response.success) {
        setCurrentSession(response.data);
        setMessages([]);
        fetchChats();
        showToast('New chat session created', 'success');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      showToast('Failed to create new session', 'error');
    }
  };

  const loadSession = async (sessionId: string) => {
    const session = sessions.find(s => s._id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const deleteSession = async (sessionId: string) => {
    showConfirmation('Are you sure you want to delete this chat session?', async () => {
      try {
        await api.delete(`/chat/${sessionId}`, token || undefined);
        if (currentSession?._id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
        fetchChats();
        showToast('Chat session deleted', 'success');
      } catch (error) {
        console.error('Failed to delete session:', error);
        showToast('Failed to delete session', 'error');
      }
    });
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || message;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage('');
    setLoading(true);

    try {
      // Check if this is a request for decision explanations
      if (messageText.toLowerCase().includes('explain') && messageText.toLowerCase().includes('decision')) {
        if (!selectedJob) {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: 'Please select a specific job first to get decision explanations.',
            timestamp: new Date().toISOString(),
          };
          setMessages([...newMessages, assistantMessage]);
        } else {
          // For now, provide general explanations. In a full implementation, this would require applicant selection
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: 'Decision explanations are available in the screening results. Click "View" on any candidate to see detailed AI reasoning for their score and status.',
            timestamp: new Date().toISOString(),
          };
          setMessages([...newMessages, assistantMessage]);
        }
      } else {
        const response = await api.post<{ success: boolean; data: { response: string } }>(
          '/chat/message',
          { message: messageText, jobId: selectedJob || undefined, sessionId: currentSession?._id },
          token || undefined
        );
        if (response.success) {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date().toISOString(),
          };
          const updatedMessages = [...newMessages, assistantMessage];
          setMessages(updatedMessages);

          // Update current session
          if (currentSession) {
            setCurrentSession({
              ...currentSession,
              messages: updatedMessages
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `I encountered an error processing your request. ${error?.response?.data?.error?.message || 'Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    showToast('Chat cleared', 'success');
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

      <div className="flex-1 flex gap-3 sm:gap-6 min-h-0">
        <div className="w-48 sm:w-64 bg-white rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 hidden md:block">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Chat Sessions</h3>
            <div className="flex gap-2">
              <button
                onClick={createNewSession}
                className="text-blue-600 hover:text-blue-800"
                title="New Chat"
              >
                <FaComments className="w-3.5 h-4" />
              </button>
              <button onClick={() => showConfirmation('Are you sure you want to clear the chat history?', clearChat)} className="text-slate-400 hover:text-red-500">
                <FaTrash className="w-3.5 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session._id}
                className={`p-2 sm:p-3 rounded-lg transition-colors ${
                  currentSession?._id === session._id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                }`}
              >
                <button
                  onClick={() => loadSession(session._id)}
                  className="w-full text-left"
                >
                  <p className="font-medium text-slate-900 text-sm truncate">{session.title}</p>
                  <p className="text-xs text-slate-500">{session.messages?.length || 0} msgs</p>
                </button>
                <button
                  onClick={() => deleteSession(session._id)}
                  className="float-right text-red-500 hover:text-red-700 text-xs mt-1"
                  title="Delete session"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className="mb-1 whitespace-pre-wrap">
            {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-slate-800 font-semibold">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-72' : 'w-0'} bg-white border-r border-slate-200 transition-all duration-300 flex-shrink-0 overflow-hidden`}>
        <div className="w-72 p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Chat History</h3>
            <button
              onClick={clearChat}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear current chat"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <FaRobot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No chat history yet</p>
                <p className="text-xs text-slate-400 mt-1">Start a conversation below</p>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session._id}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <FaRobot className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate group-hover:text-blue-600">
                        {session.title}
                      </p>
                      {session.jobId && (
                        <p className="text-xs text-slate-500 truncate">{session.jobId.title}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
              >
                <FaChevronRight className={`w-4 h-4 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-slate-900">AI Recruitment Assistant</h1>
                  <p className="text-xs text-slate-500">Powered by Gemini AI</p>
                </div>
              </div>
            </div>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <FaRobot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">How can I help you today?</h2>
              <p className="text-slate-500 text-center mb-6 max-w-md">
                I can help you analyze candidates, compare profiles, suggest interview questions, and more.
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.prompt)}
                    disabled={loading}
                    className={`group flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                        : 'bg-white border border-slate-200'
                    } rounded-2xl px-4 py-3 shadow-sm`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaRobot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                          {renderMessageContent(msg)}
                        </div>
                        <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaUser className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FaRobot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about candidates, jobs, or hiring process..."
                rows={1}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!message.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="flex items-center gap-1">
                <FaLightbulb className="w-3 h-3" />
                AI responses are AI-generated and may not be 100% accurate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}