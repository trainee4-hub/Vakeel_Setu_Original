import { useState, useEffect, useRef } from 'react';
import { getAuthToken } from '@/utils/auth';
import {
  API_BASE_URL,
} from "@shared/services/apiClient";

const ChatRoom = ({ consultationId, user, onBack }) => {
    const [consultation, setConsultation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const previousMessagesLength = useRef(0);

    useEffect(() => {
        fetchConsultation();
        fetchMessages();

        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [consultationId]);

    // Initial scroll to bottom when component mounts
    useEffect(() => {
        if (!loading && messages.length > 0) {
            setTimeout(() => {
                const container = messagesContainerRef.current;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        }
    }, [loading, messages.length]);

    useEffect(() => {
        // Only scroll when messages are actually added (not on polling updates)
        if (messages.length > previousMessagesLength.current) {
            const container = messagesContainerRef.current;
            if (container) {
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
                // Scroll if user sent message (new message) or if already near bottom
                if (isNearBottom || loading) {
                    scrollToBottom();
                }
            } else if (loading) {
                scrollToBottom();
            }
            previousMessagesLength.current = messages.length;
        }
    }, [messages.length, loading]);

    const scrollToBottom = () => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            return;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const fetchConsultation = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/consultation/${consultationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setConsultation(data.consultation);
            }
        } catch (error) {
            console.error('Error fetching consultation:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/consultation/${consultationId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const chats = data.chats || [];
                setMessages(prev => {
                    // Update if length changed, last message is different, or read status changed
                    if (prev.length !== chats.length ||
                        (chats.length > 0 && prev.length > 0 &&
                            (prev[prev.length - 1]._id !== chats[chats.length - 1]._id ||
                                prev[prev.length - 1].isRead !== chats[chats.length - 1].isRead))) {
                        return chats;
                    }
                    return prev;
                });
                // Sync messagesUsed/messageLimit from response
                setConsultation(prev => prev ? { ...prev, messagesUsed: data.messagesUsed ?? prev.messagesUsed, messageLimit: data.messageLimit ?? prev.messageLimit } : prev);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/consultation/${consultationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newMessage.trim() })
            });
            const data = await response.json();
            if (data.success) {
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');
                // Update consultation message count
                setConsultation(prev => ({
                    ...prev,
                    messagesUsed: data.messagesUsed ?? prev.messagesUsed,
                    messageLimit: data.messageLimit ?? prev.messageLimit,
                    status: (data.messagesUsed ?? prev.messagesUsed) >= (data.messageLimit ?? prev.messageLimit) ? 'completed' : prev.status
                }));
                // Scroll only the messages container, not the whole page
                setTimeout(() => {
                    const container = messagesContainerRef.current;
                    if (container) {
                        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                    }
                }, 50);
            } else {
                alert(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const otherParty = user?.role === 'advocate' ? consultation?.user : consultation?.advocate;
    const isActive = consultation?.status === 'active';
    const isMessageType = consultation?.type === 'message';
    const messagesRemaining = (consultation?.messageLimit || 0) - (consultation?.messagesUsed || 0);
    const isUserSide = user?.role !== 'advocate';

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="inline-block size-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400">Loading conversation...</p>
                </div>
            </div>
        );
    }

    // Guard: only message consultations have a chat
    if (consultation && !isMessageType) {
        return (
            <div className="max-w-4xl mx-auto px-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">storefront</span>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Offline Consultation</h2>
                    <p className="text-slate-500 text-sm mb-6">This is an in-person booking. Chat is only available for message consultations.</p>
                    <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                        Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    // Guard: payment not done yet
    if (consultation && !isActive) {
        return (
            <div className="max-w-4xl mx-auto px-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-amber-400 mb-4 block">hourglass_empty</span>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Chat Not Available Yet</h2>
                    <p className="text-slate-500 text-sm mb-2">
                        {consultation.status === 'pending'
                            ? 'Complete payment to start chatting with the advocate.'
                            : `This consultation is ${consultation.status}.`}
                    </p>
                    <p className="text-xs text-slate-400 mb-6">Status: <span className="font-bold uppercase">{consultation.status}</span></p>
                    <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                        Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6">
            {/* Chat Header */}
            <div className="bg-white p-6 rounded-t-3xl border border-b-0 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="size-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="size-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                            {otherParty?.profileUrl || otherParty?.personalDetails?.profileUrl || otherParty?.avatar?.url ? (
                                <img
                                    src={otherParty?.profileUrl || otherParty?.personalDetails?.profileUrl || otherParty?.avatar?.url}
                                    alt={otherParty.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-500 text-2xl">person</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {otherParty?.personalDetails?.fullName || otherParty?.fullName || otherParty?.name || 'Unknown'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {otherParty?.professionalCredentials?.practiceAreas?.slice(0,2).map(a => a.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())).join(', ') || (user?.role === 'advocate' ? 'Client' : 'Legal Advisor')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}>
                            {consultation?.status?.toUpperCase()}
                        </div>
                        {isUserSide && (
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Messages Left</p>
                                <p className={`text-2xl font-bold ${messagesRemaining <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
                                    {messagesRemaining}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div
                id="messages-container"
                ref={messagesContainerRef}
                className="bg-slate-50 border-x border-slate-200 h-[50vh] overflow-y-auto p-6 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="text-center py-10">
                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">chat</span>
                        <p className="text-slate-500">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const myRole = user?.role === 'advocate' ? 'Advocate' : 'User';
                        const isMyMessage = msg.senderModel === myRole;
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                                    <div className={`flex items-end gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                                        <div className="size-8 rounded-full overflow-hidden flex-shrink-0">
                                            {msg.sender?.profileUrl || msg.sender?.personalDetails?.profileUrl || msg.sender?.avatar?.url ? (
                                                <img
                                                    src={msg.sender?.profileUrl || msg.sender?.personalDetails?.profileUrl || msg.sender?.avatar?.url}
                                                    alt={msg.sender.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${isMyMessage ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                                                    <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl ${isMyMessage
                                            ? 'bg-amber-500 text-white rounded-br-md shadow-sm'
                                            : 'bg-white text-slate-700 rounded-bl-md border border-slate-200 shadow-sm'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 mt-1 ${isMyMessage ? 'flex-row-reverse mr-10' : 'ml-10'}`}>
                                        <p className="text-[10px] text-slate-600">
                                            {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {isMyMessage && (
                                            <div className="flex items-center">
                                                {msg.isRead ? (
                                                    <span className="material-symbols-outlined text-[14px] text-blue-400" style={{ fontVariationSettings: '"FILL" 1' }} title="Read">
                                                        done_all
                                                    </span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[14px] text-slate-500" title="Delivered">
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
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 rounded-b-3xl border border-t-0 border-slate-200 shadow-sm">
                {isActive ? (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isUserSide && messagesRemaining <= 0 ? "Message limit reached" : "Type your message..."}
                            disabled={isUserSide && messagesRemaining <= 0}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending || (isUserSide && messagesRemaining <= 0)}
                            className="size-12 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 flex items-center justify-center transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <div className="size-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="material-symbols-outlined">send</span>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-slate-500 text-sm">This consultation has been {consultation?.status}</p>
                    </div>
                )}
            </div>

            {/* Consultation Info Footer */}
            <div className="mt-4 px-4 flex items-center justify-between text-xs text-slate-600">
                <span>
                    ₹{consultation?.payment?.amount} • {consultation?.type === 'message' ? 'Message Consultation' : 'Offline Consultation'}
                    {consultation?.type === 'offline' && consultation?.advocate?.consultationRates?.offline?.location && (
                        <> • {consultation.advocate.consultationRates.offline.location}</>
                    )}
                </span>
                <span>Started {new Date(consultation?.startedAt || consultation?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
        </div>
    );
};

export default ChatRoom;
