import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  Square,
  Play,
  Pause,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { compressImage, AudioVoiceRecorder, formatDuration, formatFileSize } from '../../services/mediaService';
import { ChatMessage } from '../../types';

export const ChatDetailScreen: React.FC = () => {
  const {
    activeConversation,
    setActiveConversation,
    activeChatUser,
    setActiveChatUser,
    activeMessages,
    sendMessage,
    deleteMessage,
    startCall,
    isOnline,
    showToast,
  } = useApp();

  const { userProfile } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorderRef = useRef<AudioVoiceRecorder | null>(null);
  const recordTimerRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  if (!activeConversation || !activeChatUser) return null;

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage('');
    const replyMeta = replyTarget
      ? {
          replyTo: {
            id: replyTarget.id,
            senderName: replyTarget.senderName,
            text: replyTarget.content || 'Media message',
          },
        }
      : {};
    setReplyTarget(null);

    await sendMessage(text, 'text', undefined, replyMeta);
  };

  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Compressing image...');
      const compressed = await compressImage(file, 1200, 0.8);
      await sendMessage('📷 Photo', 'image', compressed, {
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      console.error('Failed to send image', err);
      showToast('Image send failed');
    }
  };

  const handleFileSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await sendMessage(file.name, 'file', base64, {
        fileName: file.name,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      voiceRecorderRef.current = new AudioVoiceRecorder();
      await voiceRecorderRef.current.startRecording();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error', err);
      showToast('Microphone access denied');
    }
  };

  const stopAndSendVoiceNote = async () => {
    if (!voiceRecorderRef.current) return;
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecordingAudio(false);

    try {
      const { audioUrl, duration } = await voiceRecorderRef.current.stopRecording();
      await sendMessage('🎤 Voice message', 'audio', audioUrl, { duration });
    } catch (err) {
      console.error('Failed to record audio', err);
      showToast('Voice message recording failed');
    }
  };

  const cancelVoiceRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    voiceRecorderRef.current?.cancelRecording();
    setIsRecordingAudio(false);
    setRecordingSeconds(0);
  };

  return (
    <div id="chat-detail-view" className="flex flex-col h-full bg-neutral-950">
      {/* Chat Detail Top Navigation Bar */}
      <div className="flex items-center justify-between p-3.5 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 z-10">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-chats"
            onClick={() => {
              setActiveConversation(null);
              setActiveChatUser(null);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
              {activeChatUser.photoURL ? (
                <img src={activeChatUser.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {activeChatUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {activeChatUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-neutral-900" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{activeChatUser.displayName}</h3>
            <p className="text-[11px] text-neutral-400">
              {activeChatUser.isOnline ? (
                <span className="text-green-400 font-medium">Online</span>
              ) : (
                `@${activeChatUser.username}`
              )}
            </p>
          </div>
        </div>

        {/* Action icons: Audio Call & Video Call */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-trigger-voice-call"
            onClick={() => startCall(activeChatUser, 'audio')}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
            title="Encrypted Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            id="btn-trigger-video-call"
            onClick={() => startCall(activeChatUser, 'video')}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
            title="Encrypted Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-300">End-to-End Encrypted Direct Channel</p>
            <p className="text-xs max-w-xs text-neutral-500">
              No third-party surveillance. Messages are delivered instantly online or queued for offline Bluetooth sync.
            </p>
          </div>
        ) : (
          activeMessages.map((msg) => {
            const isMe = msg.senderId === userProfile?.uid;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Reply preview if replying */}
                {msg.replyTo && (
                  <div
                    className={`text-[10px] px-3 py-1 rounded-t-lg bg-neutral-800/80 border-l-2 border-blue-500 mb-0.5 max-w-xs truncate ${
                      isMe ? 'text-neutral-300' : 'text-neutral-400'
                    }`}
                  >
                    <span className="font-bold text-blue-400">{msg.replyTo.senderName}: </span>
                    {msg.replyTo.text}
                  </div>
                )}

                <div
                  className={`relative max-w-[82%] sm:max-w-md px-3.5 py-2.5 rounded-2xl text-sm break-words shadow-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-neutral-800/90 text-neutral-100 border border-neutral-700/60 rounded-bl-xs'
                  }`}
                >
                  {/* Photo payload */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-1.5 max-h-72 bg-black/40">
                      <img src={msg.mediaUrl} alt="Photo" className="w-full h-full object-cover rounded-xl" />
                    </div>
                  )}

                  {/* Audio voice note payload */}
                  {msg.type === 'audio' && msg.mediaUrl && (
                    <div className="flex items-center gap-2 py-1 min-w-[200px]">
                      <audio controls src={msg.mediaUrl} className="w-full h-8" />
                    </div>
                  )}

                  {/* File attachment payload */}
                  {msg.type === 'file' && (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/20 mb-1 border border-white/10">
                      <Paperclip className="w-5 h-5 shrink-0 text-blue-300" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{msg.fileName || 'Attachment'}</p>
                        <p className="text-[10px] text-white/70">{formatFileSize(msg.fileSize || 0)}</p>
                      </div>
                      {msg.mediaUrl && (
                        <a
                          href={msg.mediaUrl}
                          download={msg.fileName || 'download'}
                          className="p-1 rounded-lg hover:bg-white/20 transition"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Text content */}
                  {msg.type !== 'image' && msg.type !== 'audio' && <p className="leading-relaxed">{msg.content}</p>}

                  {/* Timestamp & Status ticks */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-75">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <span>
                        {msg.status === 'sending' ? (
                          <Clock className="w-3 h-3 text-amber-300" />
                        ) : msg.status === 'read' ? (
                          <CheckCheck className="w-3 h-3 text-sky-200" />
                        ) : (
                          <Check className="w-3 h-3 text-white/80" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick actions on hover: reply / delete */}
                <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5 mt-0.5 px-1">
                  <button
                    onClick={() => setReplyTarget(msg)}
                    className="text-[10px] text-neutral-400 hover:text-white"
                  >
                    Reply
                  </button>
                  {isMe && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply target banner */}
      {replyTarget && (
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-t border-neutral-800 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-blue-400">Replying to {replyTarget.senderName}:</span>
            <span className="text-neutral-400 truncate">{replyTarget.content || 'Media'}</span>
          </div>
          <button onClick={() => setReplyTarget(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Voice Recording Active Bar */}
      {isRecordingAudio ? (
        <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>Recording Voice Note... {formatDuration(recordingSeconds)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelVoiceRecording}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={stopAndSendVoiceNote}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Chat Input Bar */
        <form
          onSubmit={handleSendText}
          className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
        >
          {/* Image & File picker triggers */}
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            onChange={handleImageSend}
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSend}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Send Photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Attach File"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            id="chat-message-input"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-800/80 border border-neutral-700/80 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
          />

          {inputMessage.trim() ? (
            <button
              id="btn-send-chat-message"
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceRecording}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};
