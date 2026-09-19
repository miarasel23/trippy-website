'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { customerTripService } from '@/features/trips/services/customerTripService';
import { CHAT_IMAGE_BASE_URL } from '@/shared/config/appUrls';

export const AdminSupportChat: React.FC = () => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { token, user } = useAppSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isOpenRef = useRef(isOpen);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: 'admin' | 'customer'; text: string; time: string; file?: string }>
  >([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  // Poll for messages when chat is open
  useEffect(() => {
    if (!isOpen || !user?.uuid) return;
    
    let isMounted = true;
    
    const fetchChat = async () => {
      const res = await customerTripService.fetchLiveChatConversation(
        user.uuid,
        '', // admin uuid is blank
        language,
        token || undefined,
        'ADMIN'
      );
      
      if (!isMounted) return;
      
      if (res.status && res.data && Array.isArray(res.data.messages)) {
        const fetchedMessages = res.data.messages.map((m: any) => ({
          id: m.uuid || String(Math.random()),
          sender: (m.sender_type || '').toUpperCase() === 'CUSTOMER' ? 'customer' : 'admin',
          text: m.message || '',
          file: m.file_url || m.file || '',
          time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        
        if (!isOpenRef.current && fetchedMessages.length > 0) {
           const lastMsg = fetchedMessages[fetchedMessages.length - 1];
           if (lastMessageIdRef.current && lastMsg.id !== lastMessageIdRef.current) {
             const lastIdx = fetchedMessages.findIndex((m: any) => m.id === lastMessageIdRef.current);
             const newMsgs = lastIdx === -1 ? fetchedMessages : fetchedMessages.slice(lastIdx + 1);
             const adminNewMsgs = newMsgs.filter((m: any) => m.sender === 'admin');
             if (adminNewMsgs.length > 0) {
               setUnreadCount(prev => prev + adminNewMsgs.length);
             }
           }
        }
        
        if (fetchedMessages.length > 0) {
          lastMessageIdRef.current = fetchedMessages[fetchedMessages.length - 1].id;
        }

        setChatMessages(fetchedMessages);
      }
    };
    
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, user?.uuid, language, token]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const msg = chatInput.trim();
    if ((!msg && !selectedFile) || !user?.uuid) return;

    // Optimistic UI update
    const newMsg = {
      id: String(Date.now()),
      sender: 'customer' as const,
      text: msg || (selectedFile ? `[File attached: ${selectedFile.name}]` : ''),
      file: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    await customerTripService.sendLiveChatMessage(
      user.uuid,
      '', // admin uuid is blank
      msg,
      language,
      token || undefined,
      'ADMIN',
      selectedFile || undefined
    );
    removeFile();
  };

  // Only render if user is logged in
  if (!user || !user.uuid) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl mb-4 overflow-hidden flex flex-col h-[500px] max-h-[80vh] transition-all duration-300 transform origin-bottom-right animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-emerald-900 shadow-sm border-2 border-emerald-300">
                C
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isBn ? 'কাস্টমার কেয়ার' : 'Customer Care'}
                </h3>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  {isBn ? 'অনলাইন' : 'Online'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <MessageCircle className="w-8 h-8 opacity-50" />
                <p className="text-sm">
                  {isBn
                    ? 'আপনাকে কীভাবে সাহায্য করতে পারি? নিচে মেসেজ লিখুন।'
                    : 'How can we help you today? Send us a message below.'}
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'customer' ? 'items-end self-end ml-auto' : 'items-start self-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === 'customer'
                        ? 'bg-emerald-500 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.file && (
                      <div className="mb-2">
                        {msg.file.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <img src={`${CHAT_IMAGE_BASE_URL}${msg.file}`} alt="attachment" className="max-w-[200px] rounded-lg object-cover" />
                        ) : (
                          <a href={`${CHAT_IMAGE_BASE_URL}${msg.file}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            View Attachment
                          </a>
                        )}
                      </div>
                    )}
                    {msg.text && <div>{msg.text}</div>}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2">
            {selectedFile && (
              <div className="flex items-center justify-between bg-slate-100 rounded-lg p-2 text-xs text-slate-700">
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <button type="button" onClick={removeFile} className="text-slate-500 hover:text-red-500 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={isBn ? 'ফাইল যুক্ত করুন' : 'Attach file'}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <input
                type="text"
                placeholder={isBn ? 'মেসেজ লিখুন...' : 'Type your message...'}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() && !selectedFile}
                className="absolute right-1.5 w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center disabled:opacity-50 transition-opacity cursor-pointer hover:bg-emerald-600"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group relative"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
