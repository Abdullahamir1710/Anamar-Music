export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  duration: number; // in seconds
  thumbnail: string;
  streamUrl: string;
  downloadUrl?: string;
  canDownload: boolean;
  genre: string;
  mood?: string;
  releaseYear?: number;
  lyrics?: string; // LRC formatted or plain text
  bitrate?: string;
  fileSize?: number; // in bytes
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  image: string;
  genres: string[];
  monthlyListeners?: number;
  topTrackIds?: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
  year: number;
  genre: string;
  trackIds: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  createdBy: string;
  createdAt: number;
  tracks: Track[];
  isCustom?: boolean;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

export interface DownloadedItem {
  id: string;
  track: Track;
  downloadedAt: number;
  fileSize: number;
  status: 'downloading' | 'completed' | 'failed';
  progress: number; // 0 - 100
  blob?: Blob;
  error?: string;
}

export interface TasteProfile {
  topGenres: Record<string, number>;
  topArtists: Record<string, number>;
  topMoods: Record<string, number>;
  completedSongs: string[];
  repeatedSongs: Record<string, number>;
  likedTrackIds: string[];
  skippedTrackIds: Record<string, number>;
  notInterestedTrackIds?: string[];
  totalListeningTime: number; // in seconds
  recommendationsEnabled: boolean;
  historyEnabled: boolean;
}

export interface SliderCard {
  id: string;
  tag: string;
  tagColor?: string;
  title: string;
  subtitle: string;
  description?: string;
  track: Track;
  artwork: string;
  backgroundGradient: string;
  accentColor: string;
}

export type FeedSectionType =
  | 'songs'
  | 'artists'
  | 'albums'
  | 'mixed'
  | 'playlists'
  | 'genres'
  | 'moods';

export interface FeedSection {
  id: string;
  type: FeedSectionType;
  title: string;
  subtitle?: string;
  explanation?: string;
  tracks?: Track[];
  artists?: Artist[];
  albums?: Album[];
  playlists?: Playlist[];
}

export interface ListenTogetherUser {
  userId: string;
  username: string;
  isHost: boolean;
  isConnected: boolean;
  joinedAt: number;
}

export interface ListenTogetherRoomState {
  roomCode: string;
  hostId: string;
  users: ListenTogetherUser[];
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number; // in milliseconds
  lastUpdate: number; // epoch ms
  volume: number;
  queue: Track[];
  allowParticipantControl: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}
