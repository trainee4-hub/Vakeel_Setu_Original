import { useState, useEffect, useMemo, useRef } from 'react';
import { getAuthToken } from '@/utils/auth';
import {
  API_BASE_URL,
} from "@shared/services/apiClient";

const MessageConsultations = ({ user, onBack, onFindLawyer }) => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConsultationId, setSelectedConsultationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        fetchConsultations();
    }, []);

    const fetchConsultations = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/consultation`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setConsultations(data.consultations);
            }
        } catch (error) {
            console.error('Error fetching consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeConsultations = consultations.filter((c) => c.status === 'active');
    const pendingConsultations = consultations.filter((c) => ['pending', 'payment_pending'].includes(c.status));

    const orderedConsultations = useMemo(() => {
        const activeSorted = [...activeConsultations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const pendingSorted = [...pendingConsultations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return [...activeSorted, ...pendingSorted];
    }, [activeConsultations, pendingConsultations]);

    useEffect(() => {
        if (selectedConsultationId && !orderedConsultations.some((c) => c._id === selectedConsultationId)) {
            setSelectedConsultationId(null);
        }
    }, [orderedConsultations, selectedConsultationId]);

    const selectedConsultation = orderedConsultations.find((c) => c._id === selectedConsultationId) || null;
    const currentUserId = user?.id || user?._id;
    const isUserSide = user?.role !== 'advocate';

    const getOtherParty = (consultation) => {
        const isAdvocate = user?.role === 'advocate';
        return isAdvocate ? consultation.user : consultation.advocate;
    };

    const getOtherRoleLabel = () => (user?.role === 'advocate' ? 'Client' : 'Advocate');

    const getSubjectText = (consultation) => {
        if (!consultation?.subject) return 'Legal Consultation';
        return consultation.subject.startsWith('Consultation with')
            ? 'General Legal Consultation'
            : consultation.subject;
    };

    useEffect(() => {
        let isCurrent = true;
        let poller;

        const fetchMessages = async (consultationId, silent = false) => {
            if (!consultationId) return;
            if (!silent) {
                setMessagesLoading(true);
            }
            try {
                const token = getAuthToken();
                const response = await fetch(`${API_BASE_URL}/consultation/${consultationId}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (isCurrent && data.success) {
                    setMessages(data.messages || []);
                    setConsultations((prev) =>
                        prev.map((consultation) =>
                            consultation._id === consultationId
                                ? {
                                    ...consultation,
                                    messagesUsed: data.messagesUsed ?? consultation.messagesUsed,
                                    messageLimit: data.messageLimit ?? consultation.messageLimit,
                                }
                                : consultation
                        )
                    );
                }
            } catch (error) {
                if (isCurrent) {
                    console.error('Error fetching messages:', error);
                }
            } finally {
                if (isCurrent && !silent) {
                    setMessagesLoading(false);
                }
            }
        };

        if (!selectedConsultationId) {
            setMessages([]);
            setMessagesLoading(false);
            return () => {
                isCurrent = false;
            };
        }

        fetchMessages(selectedConsultationId);
        poller = window.setInterval(() => {
            fetchMessages(selectedConsultationId, true);
        }, 5000);

        return () => {
            isCurrent = false;
            if (poller) {
                window.clearInterval(poller);
            }
        };
    }, [API_BASE_URL, selectedConsultationId]);

    useEffect(() => {
        if (!selectedConsultationId || !messagesContainerRef.current) {
            return;
        }
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, [messages, selectedConsultationId]);

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const content = newMessage.trim();
        if (!selectedConsultation || !content || sending || selectedConsultation.status !== 'active') {
            return;
        }

        const messagesRemaining = (selectedConsultation.messageLimit || 0) - (selectedConsultation.messagesUsed || 0);
        if (isUserSide && messagesRemaining <= 0) {
            return;
        }

        const tempMessageId = `temp-${Date.now()}`;
        const optimisticMessage = {
            _id: tempMessageId,
            content,
            createdAt: new Date().toISOString(),
            sender: { _id: currentUserId },
            isRead: false,
            _deliveryState: 'sending',
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage('');
        setSending(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/consultation/${selectedConsultation._id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            if (data.success) {
                setMessages((prev) => {
                    const hasTemp = prev.some((msg) => msg._id === tempMessageId);
                    if (!hasTemp) {
                        return [...prev, data.message];
                    }
                    return prev.map((msg) => (msg._id === tempMessageId ? data.message : msg));
                });
                setConsultations((prev) =>
                    prev.map((consultation) => {
                        if (consultation._id !== selectedConsultation._id) {
                            return consultation;
                        }
                        const nextMessagesUsed = data.messagesUsed ?? consultation.messagesUsed;
                        return {
                            ...consultation,
                            messagesUsed: nextMessagesUsed,
                            messageLimit: data.messageLimit ?? consultation.messageLimit,
                            status:
                                isUserSide && nextMessagesUsed >= (consultation.messageLimit || 0)
                                    ? 'completed'
                                    : consultation.status,
                        };
                    })
                );
                return;
            }
            setMessages((prev) => prev.filter((msg) => msg._id !== tempMessageId));
            setNewMessage(content);
            alert(data.message || 'Failed to send message');
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => prev.filter((msg) => msg._id !== tempMessageId));
            setNewMessage(content);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (!loading && orderedConsultations.length === 0) {
        return (
            <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-6 py-12">
                <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                    <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-8 p-6 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                            <span className="material-symbols-outlined text-6xl text-slate-400">forum</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">No Messages Yet</h1>
                        <p className="text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed text-lg">
                            Your secure chats will appear here once a consultation becomes active.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                            {user?.role !== 'advocate' && (
                                <button
                                    onClick={onFindLawyer}
                                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 text-white font-bold text-lg shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                >
                                    Start a Consultation
                                    <span className="material-symbols-outlined text-xl">add_comment</span>
                                </button>
                            )}
                            <button
                                onClick={onBack}
                                className="px-6 py-3.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <span className="material-symbols-outlined">chat</span>
                        </span>
                        Messages
                    </h1>
                    <p className="text-slate-500 ml-1">Choose a conversation to start chatting.</p>
                </div>
                <div className="flex gap-3">
                    {user?.role !== 'advocate' && (
                        <button
                            onClick={onFindLawyer}
                            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm hover:border-amber-400 hover:text-amber-600 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            New Consultation
                        </button>
                    )}
                    <button
                        onClick={onBack}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="size-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-medium">Syncing conversations...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
                    <aside className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/60">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Conversations</h2>
                                <span className="text-xs font-semibold text-slate-500">
                                    {activeConsultations.length} Active • {pendingConsultations.length} Pending
                                </span>
                            </div>
                        </div>
                        <div className="max-h-[68vh] overflow-y-auto p-3 space-y-2">
                            {orderedConsultations.map((consultation) => {
                                const otherParty = getOtherParty(consultation);
                                const otherName = otherParty?.name || 'Unknown User';
                                const roleLabel = getOtherRoleLabel();
                                const isActive = consultation.status === 'active';
                                const isSelected = consultation._id === selectedConsultationId;
                                return (
                                    <button
                                        key={consultation._id}
                                        onClick={() => setSelectedConsultationId(consultation._id)}
                                        className={`w-full text-left p-3 rounded-2xl border transition-all ${isSelected
                                            ? 'border-amber-300 bg-amber-50/60 shadow-sm'
                                            : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                        type="button"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative shrink-0">
                                                <div className="size-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                                                    {otherParty?.profileUrl || otherParty?.personalDetails?.profileUrl || otherParty?.avatar?.url ? (
                                                        <img src={otherParty?.profileUrl || otherParty?.personalDetails?.profileUrl || otherParty?.avatar?.url} alt={otherName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <span className="material-symbols-outlined text-xl">person</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {isActive && (
                                                    <div className="absolute -bottom-1 -right-1 size-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{otherName}</p>
                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                        {new Date(consultation.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{getSubjectText(consultation)}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${user?.role === 'advocate'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                                        }`}>
                                                        {roleLabel}
                                                    </span>
                                                    <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-600' : 'text-amber-600'
                                                        }`}>
                                                        {isActive ? 'Active' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <section className="bg-white border border-slate-200 rounded-3xl shadow-sm min-h-[68vh] overflow-hidden flex flex-col">
                        {selectedConsultation ? (
                            <>
                                <div className="p-5 border-b border-slate-100 bg-slate-50/60">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                {getOtherParty(selectedConsultation)?.profileUrl || getOtherParty(selectedConsultation)?.personalDetails?.profileUrl || getOtherParty(selectedConsultation)?.avatar?.url ? (
                                                    <img
                                                        src={getOtherParty(selectedConsultation)?.profileUrl || getOtherParty(selectedConsultation)?.personalDetails?.profileUrl || getOtherParty(selectedConsultation)?.avatar?.url}
                                                        alt={getOtherParty(selectedConsultation)?.name || 'User'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined text-xl">person</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 truncate">
                                                    {getOtherParty(selectedConsultation)?.name || 'Unknown User'}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {getOtherRoleLabel()} • {getSubjectText(selectedConsultation)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${selectedConsultation.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                            {selectedConsultation.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                                <div ref={messagesContainerRef} className="flex-1 min-h-[48vh] max-h-[68vh] overflow-y-auto p-5 bg-slate-50 space-y-3">
                                    {messagesLoading ? (
                                        <div className="h-full min-h-[40vh] flex flex-col items-center justify-center">
                                            <div className="size-8 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                                            <p className="text-sm text-slate-400">Loading chat...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="h-full min-h-[40vh] flex items-center justify-center text-center px-4">
                                            <div>
                                                <span className="material-symbols-outlined text-4xl text-slate-300">chat</span>
                                                <p className="mt-3 text-sm text-slate-500">No messages yet. Start the conversation.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const senderId = message.sender?._id || message.sender?.id;
                                            const isMyMessage = senderId && currentUserId && String(senderId) === String(currentUserId);
                                            return (
                                                <div key={message._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[82%] flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMyMessage
                                                            ? 'bg-amber-500 text-white rounded-br-md'
                                                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md'
                                                            }`}>
                                                            <p className="leading-relaxed">{message.content}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1 px-1">
                                                            <p className="text-[10px] text-slate-400">
                                                                {new Date(message.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            {isMyMessage && (
                                                                <div className="flex items-center">
                                                                    {message._deliveryState === 'sending' ? (
                                                                        <span
                                                                            className="material-symbols-outlined text-[13px] text-slate-400"
                                                                            style={{ fontVariationSettings: '"FILL" 1' }}
                                                                            title="Sending"
                                                                        >
                                                                            done
                                                                        </span>
                                                                    ) : (
                                                                        <span
                                                                            className={`material-symbols-outlined text-[14px] ${message.isRead ? 'text-blue-400' : 'text-slate-400'
                                                                                }`}
                                                                            style={{ fontVariationSettings: '"FILL" 1' }}
                                                                            title={message.isRead ? 'Read' : 'Delivered'}
                                                                        >
                                                                            done_all
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-white">
                                    {selectedConsultation.status === 'active' ? (
                                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(event) => setNewMessage(event.target.value)}
                                                placeholder={
                                                    isUserSide && (selectedConsultation.messageLimit || 0) - (selectedConsultation.messagesUsed || 0) <= 0
                                                        ? 'Message limit reached'
                                                        : 'Type your message...'
                                                }
                                                disabled={
                                                    sending ||
                                                    (isUserSide && (selectedConsultation.messageLimit || 0) - (selectedConsultation.messagesUsed || 0) <= 0)
                                                }
                                                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    !newMessage.trim() ||
                                                    sending ||
                                                    (isUserSide && (selectedConsultation.messageLimit || 0) - (selectedConsultation.messagesUsed || 0) <= 0)
                                                }
                                                className="size-11 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {sending ? (
                                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <span className="material-symbols-outlined text-sm">send</span>
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                                            <span className="material-symbols-outlined text-base">hourglass_top</span>
                                            Chat will be available after approval.
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-full min-h-[68vh] flex items-center justify-center p-8 text-center">
                                <div>
                                    <span className="material-symbols-outlined text-5xl text-slate-300">forum</span>
                                    <p className="mt-3 text-lg font-bold text-slate-500">Advocate Connect</p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default MessageConsultations;
