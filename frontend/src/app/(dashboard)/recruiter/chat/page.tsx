"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { FaPaperPlane, FaTrash, FaLightbulb, FaQuestionCircle, FaFileAlt, FaUser, FaRobot, FaComments } from 'react-icons/fa';
import { Send } from 'lucide-react';
import { SkeletonText, SkeletonAvatar } from '@/components/ui/Skeleton';

interface Job {
  _id: string;
  title: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatSession {
  _id: string;
  title: string;
  messages: ChatMessage[];
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

  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    confirmAction();
    setShowConfirmModal(false);
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { jobs: Job[] } }>('/jobs/all', token || undefined);
      if (response.success) {
        setJobs(response.data.jobs);
        if (response.data.jobs.length > 0) {
          setSelectedJob(response.data.jobs[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await api.get<{ success: boolean; data: ChatSession[] }>('/chat', token || undefined);
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
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
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
    showToast('Chat cleared successfully', 'success');
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Chat Assistant</h1>
          <p className="text-sm sm:text-base text-slate-500">Ask questions about candidates and jobs</p>
        </div>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base w-full sm:w-auto"
        >
          <option value="">All Jobs</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
      </div>

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
            {sessions.length === 0 && (
              <p className="text-sm text-slate-500">No chat history</p>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {loading && messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-xl bg-slate-100">
                    <div className="flex items-start gap-2 sm:gap-3">
                      {i % 2 === 1 && <SkeletonAvatar size="sm" className="mt-0.5" />}
                      <div className="space-y-2">
                        <SkeletonText lines={i % 2 === 0 ? 1 : 2} />
                      </div>
                      {i % 2 === 0 && <SkeletonAvatar size="sm" className="mt-0.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 sm:mb-4">
                <FaRobot className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">AI Recruitment Assistant</h2>
              <p className="text-slate-500 text-center mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                Ask me anything about your candidates, jobs, or hiring process.
              </p>
              <div className="flex flex-wrap gap-2 justify-center px-4">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs sm:text-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {msg.role === 'assistant' && (
                        <FaRobot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="p-3 sm:p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!message.trim() || loading}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              AI responses may not be 100% accurate
            </p>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">Confirm Action</h2>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              <p className="text-xs sm:text-sm text-slate-700 mb-4 sm:mb-6">{confirmMessage}</p>
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}