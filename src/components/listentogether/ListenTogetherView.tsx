import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  Copy,
  Check,
  LogOut,
  Send,
  Play,
  Pause,
  Crown,
  WifiOff,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  Settings,
  Smile,
} from 'lucide-react';
import {
  listenTogetherClient,
  ListenTogetherClientState,
} from '../../services/listenTogetherClient';
import { usePlayer } from '../../context/PlayerContext';

const REACTION_EMOJIS = ['❤️', '🔥', '⚡', '🎉', '🎵', '👏', '🚀', '✨'];

export const ListenTogetherView: React.FC = () => {
  const { currentTrack, isPlaying } = usePlayer();
  const [ltState, setLtState] = useState<ListenTogetherClientState>(
    listenTogetherClient.getState()
  );
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [usernameInput, setUsernameInput] = useState(ltState.username);
  const [chatInput, setChatInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const unsubscribe = listenTogetherClient.subscribe((state) => {
      setLtState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      await listenTogetherClient.createRoom(usernameInput);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomCode.trim()) return;

    setIsJoining(true);
    try {
      await listenTogetherClient.joinRoom(inputRoomCode, usernameInput);
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = () => {
    if (!ltState.roomCode) return;
    navigator.clipboard.writeText(ltState.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    listenTogetherClient.sendChatMessage(chatInput);
    setChatInput('');
  };

  const handleSendReaction = (emoji: string) => {
    listenTogetherClient.sendReaction(emoji);
  };

  const inRoom = !!ltState.roomCode && !ltState.isPendingApproval;

  return (
    <div className="relative max-w-6xl mx-auto px-3 sm:px-6 py-6 pb-28 min-h-[calc(100vh-80px)] select-none">
      {/* Floating Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {ltState.activeReactions.map((rx) => (
          <div
            key={rx.id}
            className="absolute bottom-20 right-8 sm:right-16 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-sm shadow-2xl backdrop-blur-md animate-bounce"
            style={{
              animationDuration: '1.8s',
              transform: `translateY(-${(Date.now() - rx.timestamp) / 25}px)`,
            }}
          >
            <span className="text-xl">{rx.emoji}</span>
            <span className="text-xs font-bold text-cyan-300">{rx.username}</span>
          </div>
        ))}
      </div>

      {/* Title & Status Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider anamar-gradient-text">
              Listen Together
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multi-device synchronized audio rooms with host controls and instant sync.
          </p>
        </div>

        {/* Server & Sync Status Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
            {ltState.connectionStatus === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-cyan-400 font-bold">{ltState.pingMs}ms</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-200 font-semibold">Locked in Sync</span>
              </>
            ) : ltState.connectionStatus === 'connecting' || ltState.connectionStatus === 'reconnecting' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 font-semibold">{ltState.connectionStatus}...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Standby (Join to Connect)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {ltState.error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-red-400 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{ltState.error}</span>
          </div>
          <button
            onClick={() => listenTogetherClient.leaveRoom()}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PENDING APPROVAL SCREEN (when Auto-Accept is OFF and user is waiting for Host) */}
      {ltState.isPendingApproval && (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0E131F] border border-cyan-500/30 text-center max-w-lg mx-auto space-y-4 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center mx-auto text-cyan-400 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Join Request Sent</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The host of room <span className="font-mono text-cyan-300 font-bold">{ltState.roomCode}</span> requires approval before new listeners join. Please wait while they accept your request.
          </p>
          <div className="pt-2">
            <button
              onClick={() => listenTogetherClient.leaveRoom()}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {!inRoom && !ltState.isPendingApproval ? (
        /* ROOM SELECTION SCREEN (Create or Join with Room Code) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Nickname Box */}
          <div className="md:col-span-2 p-5 rounded-3xl bg-[#0E131F] border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Your Display Nickname
              </label>
              <p className="text-xs text-slate-400">Visible to all listeners in the synchronized room</p>
            </div>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                listenTogetherClient.setUsername(e.target.value);
              }}
              placeholder="e.g. CyberWolf"
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 text-white text-xs sm:text-sm w-full sm:w-64"
            />
          </div>

          {/* Create Room Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0E131F] border border-cyan-500/20 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 w-fit text-cyan-400">
                <Radio className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Create New Session</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Host a private group listening room with full host control. Includes Auto-Accept toggle, participant queue controls, live synchronized streaming, and chat.
              </p>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(0,210,255,0.4)] transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <span>Generating Room...</span>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Create Room</span>
                </>
              )}
            </button>
          </div>

          {/* Join Room Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0E131F] border border-purple-500/20 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 w-fit text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Join with Room Code</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Enter the unique 6-character room code provided by your host (e.g. AM7K9P). Compatible across mobile browsers, desktop, and tablets.
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                maxLength={8}
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE (e.g. AM7K9P)"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-purple-500/30 text-center font-mono font-bold tracking-widest text-sm sm:text-base text-cyan-300 placeholder-slate-500 uppercase focus:outline-none focus:border-cyan-400"
              />

              <button
                type="submit"
                disabled={isJoining || !inputRoomCode.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isJoining ? 'Joining Room...' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>
      ) : inRoom ? (
        /* ACTIVE LISTEN TOGETHER ROOM */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Room Player & Synchronized Controller */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Header Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0E131F] border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                  Active Listen Together Room
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white">
                    {ltState.roomCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold transition"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {ltState.isHost && (
                  <button
                    onClick={() => setShowSettingsModal((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold transition"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Host Settings</span>
                  </button>
                )}

                <span className="text-xs text-slate-300 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                  {ltState.isHost ? '👑 Host' : '🎧 Listener'}
                </span>

                <button
                  onClick={() => listenTogetherClient.leaveRoom()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave</span>
                </button>
              </div>
            </div>

            {/* HOST SETTINGS PANEL (Auto-Accept & Controls Toggle) */}
            {ltState.isHost && (
              <div className="p-5 rounded-3xl bg-[#0E131F] border border-cyan-500/20 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Room Access & Host Architecture</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Auto-Accept Toggle */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">Auto-Accept Listeners</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ltState.autoAccept
                          ? 'New listeners join instantly without prompt'
                          : 'Host must approve each join request'}
                      </p>
                    </div>
                    <button
                      onClick={() => listenTogetherClient.setAutoAccept(!ltState.autoAccept)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        ltState.autoAccept ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          ltState.autoAccept ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Participant Playback Control Toggle */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">Guest Control</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ltState.allowParticipantControl
                          ? 'Guests can play, pause, and seek'
                          : 'Only host controls audio playback'}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        listenTogetherClient.setParticipantControl(!ltState.allowParticipantControl)
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        ltState.allowParticipantControl ? 'bg-purple-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          ltState.allowParticipantControl ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PENDING APPROVALS LIST (When Auto-Accept is OFF) */}
            {ltState.isHost && ltState.pendingRequests.length > 0 && (
              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>Pending Join Requests ({ltState.pendingRequests.length})</span>
                  </div>
                  <button
                    onClick={() => listenTogetherClient.approveAllJoin()}
                    className="px-3 py-1.5 rounded-xl bg-green-500/25 hover:bg-green-500/35 text-green-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Accept All ({ltState.pendingRequests.length})</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ltState.pendingRequests.map((req) => (
                    <div
                      key={req.userId}
                      className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-amber-500/20 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                        <span className="font-bold text-white">{req.username}</span>
                        <span className="text-[11px] text-slate-400">requested to join</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => listenTogetherClient.approveJoin(req.userId)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 font-bold"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => listenTogetherClient.rejectJoin(req.userId)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Now Playing Synchronized Artwork & Meta */}
            {ltState.currentTrack ? (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0E131F] border border-white/5 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10 group">
                  <img
                    src={ltState.currentTrack.thumbnail}
                    alt={ltState.currentTrack.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {isPlaying && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-cyan-500/80 backdrop-blur-sm text-black font-black text-[9px] uppercase tracking-wider">
                      Live
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 block">
                    Synchronized Room Playback
                  </span>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white truncate">
                    {ltState.currentTrack.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 truncate">
                    {ltState.currentTrack.artist}
                  </p>

                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-4">
                    {ltState.isHost || ltState.allowParticipantControl ? (
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            listenTogetherClient.sendPause();
                          } else {
                            listenTogetherClient.sendPlay();
                          }
                        }}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:brightness-110 active:scale-95 transition"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause for Room</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                            <span>Play for Room</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-cyan-400 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        Synchronized with host playback
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-[#0E131F] border border-white/5 text-center text-slate-400 text-xs sm:text-sm space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-cyan-400 opacity-60" />
                <p>Waiting for host to select and play a song...</p>
                <p className="text-[11px] text-slate-500">Pick any track from the home feed or library to start group streaming!</p>
              </div>
            )}

            {/* Quick Live Reactions Bar */}
            <div className="p-4 rounded-3xl bg-[#0E131F] border border-white/5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-xs font-bold mr-2">
                <Smile className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Send Reaction:</span>
              </div>
              <div className="flex items-center gap-2">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/5 hover:bg-cyan-500/20 hover:scale-110 active:scale-95 text-base sm:text-lg transition cursor-pointer"
                    title={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Participants & Live In-Room Chat */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="p-5 rounded-3xl bg-[#0E131F] border border-white/5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Listeners ({ltState.users.length})
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ltState.users.map((u) => (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      <span className="font-semibold text-slate-200 truncate">
                        {u.username}
                        {u.userId === ltState.userId && ' (You)'}
                      </span>
                    </div>
                    {u.isHost && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0">
                        <Crown className="w-3 h-3" />
                        <span>Host</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Room Chat */}
            <div className="p-5 rounded-3xl bg-[#0E131F] border border-white/5 shadow-xl flex flex-col h-80">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    In-Room Chat
                  </h4>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-xs pr-1">
                {ltState.chatMessages.length === 0 ? (
                  <p className="text-slate-500 text-[11px] text-center pt-16">
                    Say hello to everyone in the room!
                  </p>
                ) : (
                  ltState.chatMessages.map((msg) => (
                    <div key={msg.id} className="p-2.5 rounded-2xl bg-white/[0.03] space-y-0.5">
                      <span className="font-bold text-cyan-400 text-[11px] block">
                        {msg.username}
                      </span>
                      <p className="text-slate-200 break-words">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send message to room..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2.5 rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
