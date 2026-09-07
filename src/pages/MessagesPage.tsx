import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Conversation, Message } from '../types';
import { MessageSquare, Send, Paperclip, CheckCircle2, User, Building2, ShieldCheck, AlertCircle, X } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user, showToast } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  // Deliverable proof modal in chat
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);
  const [proofError, setProofError] = useState('');

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);
        if (res.conversations.length > 0 && !activeConv) {
          setActiveConv(res.conversations[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await api.getMessages(convId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);
    }
  }, [activeConv]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !text.trim()) return;
    try {
      const res = await api.sendMessage(activeConv.id, { text });
      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            id: res.messageId,
            conversation_id: activeConv.id,
            sender_id: user?.id || '',
            text,
            read_status: 1,
            created_at: new Date().toISOString()
          }
        ]);
        setText('');
        loadConversations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !liveUrl.trim()) return;

    setSubmittingProof(true);
    setProofError('');
    try {
      const targetId = (activeConv as any).collaboration_id || activeConv.campaign_id || activeConv.id;
      const res = await api.submitDeliverableProof(targetId, {
        live_post_url: liveUrl.trim(),
        notes: proofNotes.trim()
      });

      if (res.success) {
        setProofSuccess(true);
        showToast('🎉 Deliverable proof submitted successfully to brand!');

        // Post confirmation message to chat
        const proofMessageText = `📸 [DELIVERABLE PROOF SUBMITTED]\nLive Post URL: ${liveUrl.trim()}${proofNotes ? `\nNotes: ${proofNotes.trim()}` : ''}\nStatus: Under brand review for escrow release.`;
        try {
          await api.sendMessage(activeConv.id, { text: proofMessageText });
          await loadMessages(activeConv.id);
        } catch (msgErr) {
          console.error('Failed to append proof message to chat:', msgErr);
        }

        setTimeout(() => {
          setIsProofModalOpen(false);
          setProofSuccess(false);
          setLiveUrl('');
          setProofNotes('');
          loadConversations();
        }, 1500);
      } else {
        setProofError(res.error || 'Failed to submit deliverable proof.');
      }
    } catch (err: any) {
      setProofError(err.message || 'Failed to submit proof.');
    } finally {
      setSubmittingProof(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs font-bold text-slate-400">Loading chat messaging...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[680px] grid grid-cols-1 md:grid-cols-3">
        {/* Conversations Sidebar */}
        <div className="border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col">
          <h2 className="font-heading font-extrabold text-lg mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Messaging & Chat
          </h2>

          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No active conversations. Accept an application to start chatting!</div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    activeConv?.id === conv.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <img
                    src={conv.other_party_avatar || conv.other_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs truncate text-slate-900 dark:text-white">
                        {conv.other_party_name || conv.other_name || 'Brand Partner'}
                      </div>
                      {Number(conv.unread_count || 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white animate-pulse">
                          {conv.unread_count} new
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">{conv.campaign_title || 'Direct Pitch Collaboration'}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{conv.last_message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Thread Area */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-slate-50/50 dark:bg-slate-900/50">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeConv.other_party_avatar || activeConv.other_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    alt=""
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs flex items-center gap-1 text-slate-900 dark:text-white truncate">
                      <span className="truncate">{activeConv.other_party_name || activeConv.other_name || 'Brand Partner'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{activeConv.campaign_title || 'Direct Collaboration Pitch'}</div>
                  </div>
                </div>

                {user?.role === 'creator' && (
                  <button
                    type="button"
                    onClick={() => {
                      setProofError('');
                      setProofSuccess(false);
                      setIsProofModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Content Proof
                  </button>
                )}
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map(msg => {
                  const isMine = msg.sender_id === user?.id;

                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                        <div className={`text-[9px] mt-1 text-right ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message or content brief update..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
                <button type="submit" className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">Select a conversation to start chatting.</div>
          )}
        </div>
      </div>

      {/* Deliverable Proof Modal in Messages */}
      {isProofModalOpen && activeConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-purple-950/50 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {proofSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">🎉 Deliverable Proof Submitted!</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Your post link has been forwarded to <strong className="text-white">{activeConv.other_party_name || 'the brand'}</strong> for review.
                  </p>
                </div>
                <div className="p-3 bg-slate-950/70 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-semibold inline-block">
                  Escrow payment will be automatically released upon brand approval.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        Deliverable Verification
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Escrow Protected
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white">
                      {activeConv.campaign_title || 'Direct Brand Collaboration'}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Brand: <strong className="text-slate-200">{activeConv.other_party_name || 'Brand Partner'}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProofModalOpen(false);
                      setProofError('');
                    }}
                    className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {proofError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{proofError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Live Instagram Post / Reel URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={liveUrl}
                    onChange={e => setLiveUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/... or https://www.instagram.com/p/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Provide the live public link to your published Reel, Feed Post, or Story.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Collaboration Remarks / Highlights (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={proofNotes}
                    onChange={e => setProofNotes(e.target.value)}
                    placeholder="E.g. Reel achieved 15k views in first 6 hours, tagged brand official handle..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400 font-bold block">Escrow Protected:</strong>
                    Submitting this proof notifies the brand immediately. Once confirmed, payment is released directly into your wallet balance.
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProofModalOpen(false);
                      setProofError('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProof || !liveUrl.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingProof ? 'Submitting Proof...' : 'Submit Deliverable for Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
