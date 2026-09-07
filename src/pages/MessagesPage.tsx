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
    <div className="min-h-screen bg-[#fafafa] py-8 px-4 sm:px-6 lg:px-8 text-zinc-900">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden h-[680px] grid grid-cols-1 md:grid-cols-3">
        {/* Conversations Sidebar */}
        <div className="border-r border-zinc-200 bg-zinc-50/50 p-4 flex flex-col">
          <h2 className="font-heading font-extrabold text-lg mb-4 flex items-center gap-2 text-zinc-950">
            <MessageSquare className="w-5 h-5 text-zinc-900" /> Messaging & Chat
          </h2>

          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">No active conversations. Accept an application to start chatting!</div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    activeConv?.id === conv.id
                      ? 'bg-white border border-zinc-300 shadow-xs'
                      : 'hover:bg-zinc-100/60 border border-transparent'
                  }`}
                >
                  <img
                    src={conv.other_party_avatar || conv.other_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-200"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs truncate text-zinc-950">
                        {conv.other_party_name || conv.other_name || 'Brand Partner'}
                      </div>
                      {Number(conv.unread_count || 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-zinc-900 text-white">
                          {conv.unread_count} new
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-700 font-semibold truncate">{conv.campaign_title || 'Direct Pitch Collaboration'}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{conv.last_message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Thread Area */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-[#fafafa]">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 bg-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeConv.other_party_avatar || activeConv.other_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                    alt=""
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs flex items-center gap-1 text-zinc-950 truncate">
                      <span className="truncate">{activeConv.other_party_name || activeConv.other_name || 'Brand Partner'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{activeConv.campaign_title || 'Direct Collaboration Pitch'}</div>
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
                    className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
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
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isMine
                            ? 'bg-zinc-950 text-white rounded-br-sm shadow-xs'
                            : 'bg-white text-zinc-900 border border-zinc-200 rounded-bl-sm shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message or discuss deliverables..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer shadow-xs transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-400">
              Select a conversation from the left to start messaging.
            </div>
          )}
        </div>
      </div>

      {/* Deliverable Proof Modal in Messages */}
      {isProofModalOpen && activeConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-zinc-900">
            {proofSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-950">🎉 Deliverable Proof Submitted!</h3>
                  <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto leading-relaxed">
                    Your post link has been forwarded to <strong className="text-zinc-900">{activeConv.other_party_name || 'the brand'}</strong> for review.
                  </p>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-emerald-700 font-semibold inline-block">
                  Escrow payment will be automatically released upon brand approval.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-zinc-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                        Deliverable Verification
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Escrow Protected
                      </span>
                    </div>
                    <h3 className="text-base font-black text-zinc-950">
                      {activeConv.campaign_title || 'Direct Brand Collaboration'}
                    </h3>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Brand: <strong className="text-zinc-800">{activeConv.other_party_name || 'Brand Partner'}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProofModalOpen(false);
                      setProofError('');
                    }}
                    className="text-zinc-400 hover:text-zinc-900 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {proofError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{proofError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Live Instagram Post / Reel URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={liveUrl}
                    onChange={e => setLiveUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/... or https://www.instagram.com/p/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Provide the live public link to your published Reel, Feed Post, or Story.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Collaboration Remarks / Highlights (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={proofNotes}
                    onChange={e => setProofNotes(e.target.value)}
                    placeholder="E.g. Reel achieved 15k views in first 6 hours, tagged brand official handle..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-zinc-700 leading-relaxed">
                    <strong className="text-emerald-700 font-bold block">Escrow Protected:</strong>
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
                    className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProof || !liveUrl.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
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
