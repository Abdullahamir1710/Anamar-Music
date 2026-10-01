import { Track, ListenTogetherUser, ChatMessage } from '../types/music';
import { audioEngine } from './audioEngine';
import { INITIAL_TRACKS } from './musicCatalog';

export type ListenTogetherListener = (state: ListenTogetherClientState) => void;

export interface PendingRequestItem {
  requestId: string;
  userId: string;
  username: string;
  timestamp: number;
}

export interface FloatingReaction {
  id: string;
  userId: string;
  username: string;
  emoji: string;
  timestamp: number;
}

export interface ListenTogetherClientState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  roomCode: string | null;
  userId: string | null;
  username: string;
  isHost: boolean;
  users: ListenTogetherUser[];
  pendingRequests: PendingRequestItem[];
  isPendingApproval: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number; // in seconds
  queue: Track[];
  chatMessages: ChatMessage[];
  activeReactions: FloatingReaction[];
  error: string | null;
  autoAccept: boolean;
  allowParticipantControl: boolean;
  pingMs: number;
}

class ListenTogetherClient {
  private static instance: ListenTogetherClient;
  private ws: WebSocket | null = null;
  private listeners: Set<ListenTogetherListener> = new Set();
  private pingInterval: number | null = null;
  private sessionToken: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: number | null = null;
  private lastPingSent = 0;

  private state: ListenTogetherClientState = {
    connectionStatus: 'disconnected',
    roomCode: null,
    userId: null,
    username: 'AnamarListener',
    isHost: false,
    users: [],
    pendingRequests: [],
    isPendingApproval: false,
    currentTrack: null,
    isPlaying: false,
    position: 0,
    queue: [],
    chatMessages: [],
    activeReactions: [],
    error: null,
    autoAccept: true,
    allowParticipantControl: true,
    pingMs: 24,
  };

  private constructor() {
    // Load saved username
    const savedUser = localStorage.getItem('anamar_lt_username');
    if (savedUser) {
      this.state.username = savedUser;
    } else {
      this.state.username = 'User_' + Math.floor(1000 + Math.random() * 9000);
    }
  }

  public static getInstance(): ListenTogetherClient {
    if (!ListenTogetherClient.instance) {
      ListenTogetherClient.instance = new ListenTogetherClient();
    }
    return ListenTogetherClient.instance;
  }

  public setUsername(name: string): void {
    this.state.username = name.trim() || 'AnamarListener';
    localStorage.setItem('anamar_lt_username', this.state.username);
    this.notify();
  }

  public getState(): ListenTogetherClientState {
    return { ...this.state };
  }

  public subscribe(listener: ListenTogetherListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }

  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') return 'ws://localhost:3000/api/listen-together';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/listen-together`;
  }

  // --- Connection Management ---
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        resolve();
        return;
      }

      this.state.connectionStatus = 'connecting';
      this.state.error = null;
      this.notify();

      const url = this.getWebSocketUrl();

      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        this.state.connectionStatus = 'error';
        this.state.error = 'Failed to create WebSocket connection';
        this.notify();
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        console.log('[ListenTogether] Connected to synchronized audio room server');
        this.state.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.startPing();
        this.notify();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (e) {
          console.error('[ListenTogether] Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[ListenTogether] Server connection closed');
        this.stopPing();
        if (this.state.connectionStatus !== 'disconnected') {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (e) => {
        console.warn('[ListenTogether] WebSocket error:', e);
        this.state.connectionStatus = 'error';
        this.state.error = 'Connection lost. Reconnecting...';
        this.notify();
      };
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.state.connectionStatus = 'error';
      this.state.error = 'Unable to reconnect to server. Please rejoin room.';
      this.notify();
      return;
    }

    this.state.connectionStatus = 'reconnecting';
    this.notify();

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);
    this.reconnectAttempts++;

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect().catch(() => {});
    }, delay);
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.lastPingSent = Date.now();
        this.sendMessage('ping', {});
      }
    }, 15000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private sendMessage(type: string, payload: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type, payload }));
  }

  // --- Room Actions ---
  public async createRoom(username?: string): Promise<string> {
    if (username) this.setUsername(username);
    await this.connect();

    return new Promise((resolve) => {
      const handler = (s: ListenTogetherClientState) => {
        if (s.roomCode && s.isHost) {
          unsubscribe();
          resolve(s.roomCode);
        }
      };
      const unsubscribe = this.subscribe(handler);

      this.sendMessage('create_room', {
        username: this.state.username,
      });
    });
  }

  public async joinRoom(roomCode: string, username?: string): Promise<void> {
    if (username) this.setUsername(username);
    const normalized = roomCode.trim().toUpperCase();
    if (!normalized) throw new Error('Please enter a room code');

    await this.connect();

    this.sendMessage('join_room', {
      room_code: normalized,
      username: this.state.username,
    });
  }

  public leaveRoom(): void {
    this.sendMessage('leave_room', {});
    this.stopPing();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state.connectionStatus = 'disconnected';
    this.state.roomCode = null;
    this.state.userId = null;
    this.state.isHost = false;
    this.state.users = [];
    this.state.pendingRequests = [];
    this.state.isPendingApproval = false;
    this.state.currentTrack = null;
    this.state.queue = [];
    this.state.chatMessages = [];
    this.state.activeReactions = [];
    this.sessionToken = null;
    this.notify();
  }

  // --- Host Control & Auto-Accept Management ---
  public setAutoAccept(auto: boolean): void {
    this.state.autoAccept = auto;
    this.notify();
    this.sendMessage('set_room_settings', {
      auto_accept: auto,
      allow_participant_control: this.state.allowParticipantControl,
    });
  }

  public setParticipantControl(allow: boolean): void {
    this.state.allowParticipantControl = allow;
    this.notify();
    this.sendMessage('set_room_settings', {
      auto_accept: this.state.autoAccept,
      allow_participant_control: allow,
    });
  }

  public approveJoin(userId: string): void {
    this.sendMessage('approve_join', { user_id: userId });
  }

  public approveAllJoin(): void {
    this.sendMessage('approve_all', {});
  }

  public rejectJoin(userId: string, reason?: string): void {
    this.sendMessage('reject_join', { user_id: userId, reason });
  }

  // --- Real-time Reactions ---
  public sendReaction(emoji: string): void {
    this.sendMessage('reaction', { emoji });
  }

  // --- Playback Synchronization Actions ---
  public sendPlay(): void {
    if (!this.state.roomCode) return;
    this.sendMessage('playback_action', {
      action: 'play',
      position: Math.round(audioEngine.getState().currentTime * 1000),
      server_time: Date.now(),
    });
  }

  public sendPause(): void {
    if (!this.state.roomCode) return;
    this.sendMessage('playback_action', {
      action: 'pause',
      position: Math.round(audioEngine.getState().currentTime * 1000),
      server_time: Date.now(),
    });
  }

  public sendSeek(seconds: number): void {
    if (!this.state.roomCode) return;
    this.sendMessage('playback_action', {
      action: 'seek',
      position: Math.round(seconds * 1000),
      server_time: Date.now(),
    });
  }

  public sendChangeTrack(track: Track): void {
    if (!this.state.roomCode) return;
    this.sendMessage('playback_action', {
      action: 'change_track',
      track_id: track.id,
      position: 0,
      track_info: {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album || '',
        duration: Math.round(track.duration * 1000),
        thumbnail: track.thumbnail,
      },
      server_time: Date.now(),
    });
  }

  public sendSyncQueue(queue: Track[]): void {
    if (!this.state.roomCode) return;
    this.sendMessage('playback_action', {
      action: 'sync_queue',
      queue: queue.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album || '',
        duration: Math.round(t.duration * 1000),
        thumbnail: t.thumbnail,
      })),
      server_time: Date.now(),
    });
  }

  public sendChatMessage(message: string): void {
    if (!this.state.roomCode || !message.trim()) return;
    this.sendMessage('chat', { message: message.trim() });
  }

  // --- Message Handling ---
  private handleIncomingMessage(msg: { type: string; payload: any }): void {
    const { type, payload } = msg;

    switch (type) {
      case 'pong': {
        if (this.lastPingSent > 0) {
          this.state.pingMs = Math.max(12, Date.now() - this.lastPingSent);
          this.notify();
        }
        break;
      }

      case 'room_created': {
        this.state.roomCode = payload.room_code;
        this.state.userId = payload.user_id;
        this.state.isHost = true;
        this.state.isPendingApproval = false;
        this.state.autoAccept = payload.auto_accept ?? true;
        this.state.allowParticipantControl = payload.allow_participant_control ?? true;
        this.sessionToken = payload.session_token;
        this.state.users = [
          {
            userId: payload.user_id,
            username: this.state.username,
            isHost: true,
            isConnected: true,
            joinedAt: Date.now(),
          },
        ];
        this.notify();
        break;
      }

      case 'join_pending': {
        this.state.roomCode = payload.room_code;
        this.state.userId = payload.user_id;
        this.state.isPendingApproval = true;
        this.sessionToken = payload.session_token;
        this.notify();
        break;
      }

      case 'pending_join_request': {
        // Host received a join request from a new participant
        const existing = this.state.pendingRequests.find((r) => r.userId === payload.user_id);
        if (!existing) {
          this.state.pendingRequests.push({
            requestId: payload.request_id,
            userId: payload.user_id,
            username: payload.username,
            timestamp: payload.timestamp || Date.now(),
          });
          this.notify();
        }
        break;
      }

      case 'pending_requests_list': {
        if (Array.isArray(payload.requests)) {
          this.state.pendingRequests = payload.requests.map((r: any) => ({
            requestId: r.request_id,
            userId: r.user_id,
            username: r.username,
            timestamp: r.timestamp,
          }));
          this.notify();
        }
        break;
      }

      case 'join_approved': {
        this.state.roomCode = payload.room_code;
        this.state.userId = payload.user_id;
        this.sessionToken = payload.session_token;
        this.state.isPendingApproval = false;
        this.state.isHost = false;

        const roomState = payload.state;
        if (roomState) {
          this.applyFullRoomState(roomState);
        }
        this.notify();
        break;
      }

      case 'join_rejected': {
        this.state.isPendingApproval = false;
        this.state.error = payload.reason || 'Join request was declined by host.';
        this.notify();
        break;
      }

      case 'room_settings_updated': {
        if (typeof payload.auto_accept === 'boolean') {
          this.state.autoAccept = payload.auto_accept;
        }
        if (typeof payload.allow_participant_control === 'boolean') {
          this.state.allowParticipantControl = payload.allow_participant_control;
        }
        this.notify();
        break;
      }

      case 'reaction': {
        const reaction: FloatingReaction = {
          id: payload.id || 'rx_' + Date.now(),
          userId: payload.user_id,
          username: payload.username,
          emoji: payload.emoji || '❤️',
          timestamp: payload.timestamp || Date.now(),
        };

        this.state.activeReactions = [...this.state.activeReactions.slice(-15), reaction];
        this.notify();

        // Clear reaction after 3 seconds
        setTimeout(() => {
          this.state.activeReactions = this.state.activeReactions.filter((r) => r.id !== reaction.id);
          this.notify();
        }, 3000);
        break;
      }

      case 'user_joined': {
        const existing = this.state.users.find((u) => u.userId === payload.user_id);
        if (!existing) {
          this.state.users.push({
            userId: payload.user_id,
            username: payload.username,
            isHost: false,
            isConnected: true,
            joinedAt: Date.now(),
          });
          // Remove from pending if was pending
          this.state.pendingRequests = this.state.pendingRequests.filter((r) => r.userId !== payload.user_id);
          this.notify();
        }
        break;
      }

      case 'user_left': {
        this.state.users = this.state.users.filter((u) => u.userId !== payload.user_id);
        this.state.pendingRequests = this.state.pendingRequests.filter((r) => r.userId !== payload.user_id);
        this.notify();
        break;
      }

      case 'host_changed': {
        this.state.isHost = payload.new_host_id === this.state.userId;
        this.state.users = this.state.users.map((u) => ({
          ...u,
          isHost: u.userId === payload.new_host_id,
        }));
        this.notify();
        break;
      }

      case 'sync_playback': {
        this.handlePlaybackSync(payload);
        break;
      }

      case 'chat': {
        this.state.chatMessages.push({
          id: 'msg-' + Date.now() + '-' + Math.random(),
          userId: payload.user_id,
          username: payload.username,
          message: payload.message,
          timestamp: payload.timestamp || Date.now(),
        });
        this.notify();
        break;
      }

      case 'error': {
        this.state.error = payload.message || 'Room error occurred';
        this.notify();
        break;
      }
    }
  }

  private applyFullRoomState(state: any): void {
    if (state.auto_accept !== undefined) {
      this.state.autoAccept = !!state.auto_accept;
    }
    if (state.allow_participant_control !== undefined) {
      this.state.allowParticipantControl = !!state.allow_participant_control;
    }

    if (state.users) {
      this.state.users = state.users.map((u: any) => ({
        userId: u.user_id,
        username: u.username,
        isHost: u.is_host,
        isConnected: u.is_connected ?? true,
        joinedAt: Date.now(),
      }));
    }

    if (state.pending_requests && this.state.isHost) {
      this.state.pendingRequests = state.pending_requests.map((r: any) => ({
        requestId: r.request_id,
        userId: r.user_id,
        username: r.username,
        timestamp: r.timestamp,
      }));
    }

    if (state.current_track) {
      const resolved = this.resolveTrack(state.current_track);
      this.state.currentTrack = resolved;
      const targetSec = (state.position || 0) / 1000;
      this.state.position = targetSec;
      this.state.isPlaying = !!state.is_playing;

      // Start audio at the exact synced position
      audioEngine.setTrack(resolved, this.state.isPlaying, targetSec).catch(() => {});
    }

    if (state.queue) {
      this.state.queue = state.queue.map((t: any) => this.resolveTrack(t));
    }
  }

  private handlePlaybackSync(payload: any): void {
    const action = payload.action;
    const targetSeconds = payload.position ? payload.position / 1000 : audioEngine.getState().currentTime;

    switch (action) {
      case 'play': {
        this.state.isPlaying = true;
        this.state.position = targetSeconds;
        // Check clock drift (> 0.8s requires explicit resync)
        const currentAudioTime = audioEngine.getState().currentTime;
        if (Math.abs(currentAudioTime - targetSeconds) > 0.8) {
          audioEngine.seek(targetSeconds);
          audioEngine.play().catch(() => {});
        } else {
          audioEngine.play().catch(() => {});
        }
        this.notify();
        break;
      }

      case 'pause': {
        this.state.isPlaying = false;
        this.state.position = targetSeconds;
        audioEngine.seek(targetSeconds);
        audioEngine.pause();
        this.notify();
        break;
      }

      case 'seek': {
        this.state.position = targetSeconds;
        audioEngine.seek(targetSeconds);
        this.notify();
        break;
      }

      case 'change_track': {
        if (payload.track_info) {
          const resolved = this.resolveTrack(payload.track_info);
          this.state.currentTrack = resolved;
          this.state.isPlaying = true;
          this.state.position = targetSeconds;
          audioEngine.setTrack(resolved, true, targetSeconds).catch(() => {});
          this.notify();
        }
        break;
      }

      case 'sync_queue': {
        if (payload.queue) {
          this.state.queue = payload.queue.map((t: any) => this.resolveTrack(t));
          this.notify();
        }
        break;
      }
    }
  }

  // Cross-platform track resolver: matches trackId with local catalog or stream
  private resolveTrack(info: any): Track {
    const found = INITIAL_TRACKS.find((t) => t.id === info.id);
    if (found) return found;

    return {
      id: info.id,
      title: info.title || 'Unknown Title',
      artist: info.artist || 'Unknown Artist',
      album: info.album || '',
      duration: info.duration ? info.duration / 1000 : 200,
      thumbnail: info.thumbnail || 'https://cdn-images.dzcdn.net/images/cover/667564334d2589dfebccebada3993124/1000x1000-000000-80-0-0.jpg',
      streamUrl: info.streamUrl || INITIAL_TRACKS[0].streamUrl,
      canDownload: false,
      genre: 'Anamar Sync',
    };
  }
}

export const listenTogetherClient = ListenTogetherClient.getInstance();
