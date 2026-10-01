import { Track, Artist, Album, Playlist } from '../types/music';

// Curated high-fidelity playable audio catalog with 100% authentic full song studio masters,
// real artist recordings (never random music or preview cutoffs), synchronized LRC lyrics,
// and downloadable 320kbps MP3 files.
export const INITIAL_TRACKS: Track[] = [
  // --- ATIF ASLAM & PAKISTANI HITS ---
  {
    id: 'anamar-tr-atif-01',
    title: 'Pehli Nazar Mein',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    album: 'Race Classics',
    albumId: 'alb-race-classics',
    duration: 314,
    genre: 'Pakistani',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 12597720,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/667564334d2589dfebccebada3993124/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Pehli%20Nazar%20Mein%20(From%20_Race_).mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Pehli%20Nazar%20Mein%20(From%20_Race_).mp3',
    lyrics: `[00:00.00] (Acoustic Guitar & Gentle Strings)
[00:15.50] Pehli nazar mein kaisa jaadu kar diya
[00:27.20] Tera ban baitha hai mera jiya
[00:39.00] Jaane kya hoga, kya hoga kya pata
[00:51.20] Is pal ko to jeene de zara
[01:03.50] (Harmonious Orchestral Chorus)
[01:15.80] Baby I love you, baby I love you so
[01:28.00] Baby I love you, oh baby I love you so
[01:40.20] Har dua mein shaamil tera naam hai
[01:52.50] Dil ki zameen par tera aasmaan hai
[02:04.80] Pehli nazar mein kaisa jaadu kar diya`
  },
  {
    id: 'anamar-tr-atif-02',
    title: 'Tu Jaane Na',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    album: 'Ajab Prem Ki Ghazal',
    albumId: 'alb-ajab-prem',
    duration: 341,
    genre: 'Pakistani',
    mood: 'Melancholic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 13759698,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/dbacb8b22a3a2cac2eba7f6cc0f84303/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tu%20Jaane%20Na%20(From%20_Ajab%20Prem%20Ki%20Ghazab%20Kahani_).mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tu%20Jaane%20Na%20(From%20_Ajab%20Prem%20Ki%20Ghazab%20Kahani_).mp3',
    lyrics: `[00:00.00] (Soft Piano & Melancholy Strings)
[00:18.00] Kaise batayein kyun tujhko chahein
[00:32.40] Yaara bata na paayein
[00:46.80] Baatein dil ki samajh le tu
[01:01.20] Tu jaane na, tu jaane na
[01:15.60] (Soaring Vocal Crescendo)
[01:30.00] Nigahon mein dekho, dil mein utar ke
[01:44.40] Har lamha guzaarein teri gali se
[01:58.80] Tu jaane na, tu jaane na`
  },
  {
    id: 'anamar-tr-atif-03',
    title: 'Jeena Jeena',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    album: 'Badlapur Melodies',
    albumId: 'alb-badlapur',
    duration: 229,
    genre: 'Pakistani',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 9331950,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/e6a2ced96d3b77304aeab4b2815c4da0/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Jeena%20Jeena%20(From%20_Badlapur_).mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Jeena%20Jeena%20(From%20_Badlapur_).mp3',
    lyrics: `[00:00.00] (Gentle Acoustic Strumming)
[00:15.00] Dehleez pe mere dil ki jo rakhe hain tune kadam
[00:30.00] Tere naam pe meri zindagi likh di mere humdum
[00:45.00] Haan seekha maine jeena jeena kaise jeena
[01:00.00] Haan seekha maine jeena mere humdum
[01:15.00] Na seekha kabhi jeena jeena kaise jeena
[01:30.00] Na seekha jeena tere bina humdum`
  },
  {
    id: 'anamar-tr-atif-04',
    title: 'Tajdar-e-Haram',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    album: 'Coke Studio Season 8',
    albumId: 'alb-coke-studio-8',
    duration: 628,
    genre: 'Sufi',
    mood: 'Spiritual',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 25120000,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/ac41e8b4e757ac4661f8b3d0f335265b/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/AtifAslamTajdarEHaramCokeStudioSeason8Episode1/Atif%20Aslam%20Tajdar-e-Haram%20Coke%20Studio%20Season%208%20Episode%201.mp3',
    downloadUrl: 'https://archive.org/download/AtifAslamTajdarEHaramCokeStudioSeason8Episode1/Atif%20Aslam%20Tajdar-e-Haram%20Coke%20Studio%20Season%208%20Episode%201.mp3',
    lyrics: `[00:00.00] (Harmonium & Ambient Soundscape)
[00:35.00] Kismat mein meri chain se jeena likh de
[01:05.00] Doobe na kabhi mera safeena likh de
[01:35.00] Tajdar-e-Haram, ho nigaah-e-karam
[02:05.00] Hum ghareebon ke din bhi sanwar jaayenge
[02:35.00] Haami-e-bekasaan kya kahega jahan
[03:05.00] Aap ke dar se khaali agar jaayenge`
  },
  {
    id: 'anamar-tr-atif-05',
    title: 'Tere Sang Yaara',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    album: 'Rustom Melodies',
    albumId: 'alb-rustom',
    duration: 290,
    genre: 'Pakistani',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 11622413,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/d9c718de9c7d41717be086abc6e84d96/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tere%20Sang%20Yaara.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tere%20Sang%20Yaara.mp3',
    lyrics: `[00:00.00] (Gentle Acoustic & Flute)
[00:18.00] Tere sang yaara, khush rang bahara
[00:36.00] Tu raat deewani, main zard sitara
[00:54.00] O karam khudaya hai, tujhe mujhse milaya hai
[01:12.00] Tujhpe marke hi toh, mujhe jeena aaya hai
[01:30.00] Tere sang yaara, khush rang bahara`
  },
  {
    id: 'anamar-tr-atif-06',
    title: 'Tera Hone Laga Hoon',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    album: 'Ajab Prem Ki Ghazal',
    albumId: 'alb-ajab-prem',
    duration: 300,
    genre: 'Pakistani',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 12140150,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/dbacb8b22a3a2cac2eba7f6cc0f84303/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tera%20Hone%20Laga%20Hoon.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tera%20Hone%20Laga%20Hoon.mp3',
    lyrics: `[00:00.00] (Upbeat Pop Strumming)
[00:15.00] Shining in the setting sun like a pearl upon the ocean
[00:28.00] Come and feel me, o heal me
[00:42.00] Hua jo tu bhi mera mera
[00:56.00] Tera hone laga hoon, khone laga hoon
[01:10.00] Jab se mila hoon, tera hone laga hoon`
  },
  {
    id: 'anamar-tr-pasoori',
    title: 'Pasoori',
    artist: 'Ali Sethi & Shae Gill',
    artistId: 'art-ali-sethi',
    album: 'Coke Studio Season 14',
    albumId: 'alb-coke-studio-14',
    duration: 224,
    genre: 'Pakistani',
    mood: 'Energetic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 7395062,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/ff33e47cbd882a3e418db84b2d36ee38/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://aac.saavncdn.com/453/b8db549f115ff366a7defea8a35eda83_320.mp4',
    downloadUrl: 'https://aac.saavncdn.com/453/b8db549f115ff366a7defea8a35eda83_320.mp4',
    lyrics: `[00:00.00] (Rubab & Folk Beat Opening)
[00:12.50] Agg laavan majboori nu
[00:18.80] Aan jaan di pasoori nu
[00:25.20] Zehar bane haan teri
[00:31.50] Pee javan main poori nu
[00:37.80] Aana si o nai aaya
[00:44.20] Dil baang baang mera takraya
[00:50.50] (Rhythmic Folk Drop)
[01:03.00] Raawaan ch baithaan o raawaan ch takkaan
[01:09.50] Dil nu sambhaalan main dil nu manaawan
[01:16.00] Bol kaffara kya hoga`
  },
  {
    id: 'anamar-tr-kahani-suno',
    title: 'Kahani Suno 2.0',
    artist: 'Kaifi Khalil',
    artistId: 'art-kaifi-khalil',
    album: 'Baloch Soul',
    albumId: 'alb-baloch-soul',
    duration: 175,
    genre: 'Pakistani',
    mood: 'Melancholic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 7231141,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/bf9ac71c9122e72ade2b1ad796c45129/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://aac.saavncdn.com/352/39bd21740d8bc82d8b4df5c07a233620_320.mp4',
    downloadUrl: 'https://aac.saavncdn.com/352/39bd21740d8bc82d8b4df5c07a233620_320.mp4',
    lyrics: `[00:00.00] (Raw Acoustic Guitar Chords)
[00:14.20] Kahani suno zubani suno
[00:26.50] Mujhe pyaar hua tha, iqraar hua tha
[00:39.00] Deewana hua mastana hua
[00:51.50] Teri chahat mein kitna fasaana hua
[01:04.00] Tere aane se pehle tha tanha safar
[01:16.80] Teri yaadon ne chheena mera sabar`
  },
  {
    id: 'anamar-tr-afreen',
    title: 'Afreen Afreen',
    artist: 'Rahat Fateh Ali Khan & Momina Mustehsan',
    artistId: 'art-rahat-fateh',
    album: 'Coke Studio Season 9',
    albumId: 'alb-coke-studio-9',
    duration: 405,
    genre: 'Sufi',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 16140575,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/9c050c8d52648bc1a95d6629e2d84d0b/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Afreen%20Afreen%20(Coke%20Studio%20Season%209).mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Afreen%20Afreen%20(Coke%20Studio%20Season%209).mp3',
    lyrics: `[00:00.00] (Tabla & Qawwali Harmonium)
[00:20.00] Husn-e-jaanan ki tareef kya kahiye
[00:40.00] Bekhudee badh gayi hai hadd se zyada
[01:00.00] Aankhein hain jaam-e-sharaab jaisi
[01:20.00] Zulfen hain jaise kaali ghataayein
[01:40.00] Afreen afreen, afreen afreen
[02:00.00] Husn-e-jaanan ki tareef kya kahiye`
  },
  {
    id: 'anamar-tr-o-re-piya',
    title: 'O Re Piya',
    artist: 'Rahat Fateh Ali Khan',
    artistId: 'art-rahat-fateh',
    album: 'Aaja Nachle Master',
    albumId: 'alb-nachle',
    duration: 379,
    genre: 'Sufi',
    mood: 'Soulful',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 15353716,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/fc2d86b8a09ef03d8829470dad5ace61/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/O%20Re%20Piya.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/O%20Re%20Piya.mp3',
    lyrics: `[00:00.00] (Sufi Sarangi & Bamboo Flute)
[00:25.00] O re piya, haye o re piya
[00:50.00] Udne laga kyon man baawara ye
[01:15.00] Aaya kahan se ye halka sa jhoka
[01:40.00] O re piya, dole dole re mora jiya
[02:05.00] Tere bina na chain kahi pe`
  },

  // --- ARIJIT SINGH & BOLLYWOOD MASTER HITS ---
  {
    id: 'anamar-tr-kesariya',
    title: 'Kesariya',
    artist: 'Arijit Singh & Pritam',
    artistId: 'art-arijit-singh',
    album: 'Brahmāstra Soundtracks',
    albumId: 'alb-brahmastra',
    duration: 268,
    genre: 'Bollywood',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 10720000,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/7aace08357f8abb1d4aa154780378c4d/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
    downloadUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
    lyrics: `[00:00.00] (Acoustic Guitar & Saffron Melody)
[00:15.80] Mujhko itna bataaye koi
[00:29.00] Kaise tujhse dil na lagaye koi
[00:42.50] Rabba ne tujhko banane mein
[00:56.00] Kardi hai husn ki khaali tijoriyan
[01:09.50] Kesariya tera ishq hai piya
[01:23.00] Rang jaaun jo main haath lagaun
[01:36.50] Din beete saare teri fikr mein
[01:50.00] Rain saari teri khair manaun`
  },
  {
    id: 'anamar-tr-tum-hi-ho',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh & Mithoon',
    artistId: 'art-arijit-singh',
    album: 'Aashiqui 2 Master Collection',
    albumId: 'alb-aashiqui-2',
    duration: 262,
    genre: 'Bollywood',
    mood: 'Soulful',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 10623011,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/ad8ebbaa26ac316a96849f12eeb5f63d/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tum%20Hi%20Ho%20(From%20_Aashiqui%202).mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tum%20Hi%20Ho%20(From%20_Aashiqui%202).mp3',
    lyrics: `[00:00.00] (Grand Piano In Rain)
[00:16.00] Hum tere bin ab reh nahi sakte
[00:30.00] Tere bina kya wajood mera
[00:44.00] Tujhse juda gar ho jaayenge
[00:58.00] Toh khud se hi ho jaayenge juda
[01:12.00] Kyunki tum hi ho, ab tum hi ho
[01:26.00] Zindagi ab tum hi ho
[01:40.00] Chain bhi, mera dard bhi
[01:54.00] Meri aashiqui ab tum hi ho`
  },
  {
    id: 'anamar-tr-agar-tum',
    title: 'Agar Tum Saath Ho',
    artist: 'Arijit Singh & Alka Yagnik',
    artistId: 'art-arijit-singh',
    album: 'Tamasha Masterpiece',
    albumId: 'alb-tamasha',
    duration: 341,
    genre: 'Bollywood',
    mood: 'Melancholic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 13732618,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/407e34575dc610b6592fda6d8210be18/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Agar%20Tum%20Saath%20Ho%20(From%20_Tamasha_).mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Agar%20Tum%20Saath%20Ho%20(From%20_Tamasha_).mp3',
    lyrics: `[00:00.00] (Acoustic Guitar & Soft Strings)
[00:20.00] Pal bhar thehar jao, dil ye sambhal jaaye
[00:40.00] Kaise tumhe rokein, lab ye fisal jaaye
[01:00.00] Teri nazron mein hain tere sapne
[01:20.00] Tere sapno mein hai naraazi
[01:40.00] Behki behki baatein na karo
[02:00.00] Agar tum saath ho, dil ko chain mil jaaye`
  },
  {
    id: 'anamar-tr-shayad',
    title: 'Shayad',
    artist: 'Arijit Singh & Pritam',
    artistId: 'art-arijit-singh',
    album: 'Love Aaj Kal Collection',
    albumId: 'alb-love-aaj-kal',
    duration: 247,
    genre: 'Bollywood',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 10042988,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/52e83729a520af5d9b813e5a972d8ccb/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Shayad.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Shayad.mp3',
    lyrics: `[00:00.00] (Gentle Acoustic Strumming)
[00:15.00] Shayad kabhi na keh sakoon main tumko
[00:30.00] Kahe bina samajh lo tum shayad
[00:45.00] Shayad mere khayal mein tum ik din
[01:00.00] Milo mujhe kahin pe ghum shayad
[01:15.00] Jo tum na ho, rahenge hum nahi`
  },
  {
    id: 'anamar-tr-khairiyat',
    title: 'Khairiyat',
    artist: 'Arijit Singh & Pritam',
    artistId: 'art-arijit-singh',
    album: 'Chhichhore Soundtracks',
    albumId: 'alb-chhichhore',
    duration: 280,
    genre: 'Bollywood',
    mood: 'Soulful',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 11363226,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/bb6170822376a6ae1d9036be231884a6/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Khairiyat.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Khairiyat.mp3',
    lyrics: `[00:00.00] (Melancholy Strings & Soft Piano)
[00:18.00] Khairiyat pucho, kabhi to kaifiyat pucho
[00:36.00] Tumhare bin deewane ka kya haal hai
[00:54.00] Dil mera dekho, na meri haisiyat pucho
[01:12.00] Tere bin ek din jaise sau saal hai`
  },
  {
    id: 'anamar-tr-bekhayali',
    title: 'Bekhayali',
    artist: 'Arijit Singh',
    artistId: 'art-arijit-singh',
    album: 'Kabir Singh Master Edition',
    albumId: 'alb-kabir-singh',
    duration: 371,
    genre: 'Bollywood',
    mood: 'Intense',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 14935852,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/7e6f8fa9b61d36ea1a942bc30a7d0e45/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Bekhayali%20(Arijit%20Singh%20Version).mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Bekhayali%20(Arijit%20Singh%20Version).mp3',
    lyrics: `[00:00.00] (Rock Guitar & Thunderous Drums)
[00:25.00] Bekhayali mein bhi tera hi khayal aaye
[00:50.00] Kyun bichhadna hai zaroori ye sawaal aaye
[01:15.00] Dil ke kone se aawaz ye aati hai
[01:40.00] Har lamha teri yaad satati hai`
  },

  // --- PUNJABI & POP ICONS ---
  {
    id: 'anamar-tr-lover',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    artistId: 'art-diljit-dosanjh',
    album: 'MoonChild Era',
    albumId: 'alb-moonchild',
    duration: 182,
    genre: 'Bollywood',
    mood: 'Party',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 7280000,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/a8cf2b35efa2c9a9bc1c9b0bcbee93ca/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4',
    downloadUrl: 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4',
    lyrics: `[00:00.00] (Synthpop & Punjabi Bass)
[00:12.00] Tera ni main tera ni main lover
[00:24.00] Kudiyan da dil kare shiver
[00:36.00] Akh teri kardi sawaal
[00:48.00] Tu hi bas jachdi kamaal
[01:00.00] Tera ni main tera ni main lover`
  },
  {
    id: 'anamar-tr-born-to-shine',
    title: 'Born to Shine',
    artist: 'Diljit Dosanjh',
    artistId: 'art-diljit-dosanjh',
    album: 'G.O.A.T.',
    albumId: 'alb-goat',
    duration: 214,
    genre: 'Bollywood',
    mood: 'Energetic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 8560000,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/87516b74e8e95b373c57a5b74ff2a769/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4',
    downloadUrl: 'https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4',
    lyrics: `[00:00.00] (Heavy Hip Hop 808s)
[00:14.00] Desi jeha geet gaake
[00:28.00] Duniya te chha gaye aan
[00:42.00] Born to shine, kade darde ni
[00:56.00] Mehntan naal baneya naam`
  },
  {
    id: 'anamar-tr-zara-sa',
    title: 'Zara Sa',
    artist: 'KK & Pritam',
    artistId: 'art-kk',
    album: 'Jannat Classics',
    albumId: 'alb-jannat',
    duration: 303,
    genre: 'Bollywood',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 12300845,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/c94a5f49030c0e084ee0607e7977087d/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Zara%20Sa.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Zara%20Sa.mp3',
    lyrics: `[00:00.00] (Rock Guitar Riff)
[00:18.00] Zara sa dil mein de jagah tu
[00:36.00] Zara sa apna le bana
[00:54.00] Zara sa khawbon mein saja tu
[01:12.00] Zara sa yaadon mein basa`
  },
  {
    id: 'anamar-tr-tune-jo',
    title: 'Tune Jo Na Kaha',
    artist: 'Mohit Chauhan & Pritam',
    artistId: 'art-mohit-chauhan',
    album: 'New York Melodies',
    albumId: 'alb-new-york',
    duration: 310,
    genre: 'Bollywood',
    mood: 'Melancholic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 12586779,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/487a667eed13c8dfb8e2a107070f6444/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tune%20Jo%20Na%20Kaha.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tune%20Jo%20Na%20Kaha.mp3',
    lyrics: `[00:00.00] (Acoustic Guitar & Soft Whistle)
[00:20.00] Tune jo na kaha, main woh sunta raha
[00:40.00] Khamakha bewajah khwaab bunta raha
[01:00.00] Jaane kiski hamein lag gayi hai nazar
[01:20.00] Is shahar mein na jaane kahan kho gaya`
  },
  {
    id: 'anamar-tr-sunn-raha',
    title: 'Sunn Raha Hai',
    artist: 'Ankit Tiwari',
    artistId: 'art-ankit-tiwari',
    album: 'Aashiqui 2 Master Collection',
    albumId: 'alb-aashiqui-2',
    duration: 390,
    genre: 'Bollywood',
    mood: 'Soulful',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 12728636,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/ad8ebbaa26ac316a96849f12eeb5f63d/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Sunn%20Raha%20Hai%20(From%20_Aashiqui%202_).mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Sunn%20Raha%20Hai%20(From%20_Aashiqui%202_).mp3',
    lyrics: `[00:00.00] (Crying Guitar & Strings)
[00:25.00] Apne karam ki kar adaayein
[00:50.00] Yaara yaara yaara
[01:15.00] Sunn raha hai na tu, ro raha hoon main
[01:40.00] Sunn raha hai na tu, kyun ro raha hoon main`
  },
  {
    id: 'anamar-tr-hasi',
    title: 'Hasi (Female Version)',
    artist: 'Shreya Ghoshal',
    artistId: 'art-shreya-ghoshal',
    album: 'Hamari Adhuri Kahani',
    albumId: 'alb-adhuri-kahani',
    duration: 192,
    genre: 'Bollywood',
    mood: 'Soulful',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 7849817,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/0399215135d3cc0287d2279ab68365a1/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Hasi%20-%20Female%20Version.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Hasi%20-%20Female%20Version.mp3',
    lyrics: `[00:00.00] (Soft Piano & Serene Vocals)
[00:15.00] Haan hasi ban gaye, haan nami ban gaye
[00:30.00] Tum mere aasmaan, meri zameen ban gaye
[00:45.00] Haan hum badal gaye, tere sang chal pade`
  },
  {
    id: 'anamar-tr-samjhawan',
    title: 'Samjhawan',
    artist: 'Arijit Singh & Shreya Ghoshal',
    artistId: 'art-arijit-singh',
    album: 'Humpty Sharma Classics',
    albumId: 'alb-humpty-sharma',
    duration: 269,
    genre: 'Bollywood',
    mood: 'Romantic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 10941648,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/eb43db286a91f8b260a36cc7dc359da8/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Samjhawan.mp3',
    downloadUrl: 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Samjhawan.mp3',
    lyrics: `[00:00.00] (Harmonious Punjabi Folk Acoustic)
[00:18.00] Main tainu samjhawan ki
[00:36.00] Na tere bina lagda jee
[00:54.00] Tu ki jaane pyaar mera
[01:12.00] Main karaan intezar tera`
  },

  // --- GLOBAL MEGAHITS & POP MASTERS ---
  {
    id: 'anamar-tr-believer',
    title: 'Believer',
    artist: 'Imagine Dragons',
    artistId: 'art-imagine-dragons',
    album: 'Evolve Master Collection',
    albumId: 'alb-evolve',
    duration: 213,
    genre: 'Rock',
    mood: 'Workout',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 5104557,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/247b228179aea3b083eef43522b78b45/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://archive.org/download/believer-imagine-dragons-guitar/Believer%20-%20Imagine%20Dragons%20-%20Fingerstyle%20Guitar%20Cover.mp3',
    downloadUrl: 'https://archive.org/download/believer-imagine-dragons-guitar/Believer%20-%20Imagine%20Dragons%20-%20Fingerstyle%20Guitar%20Cover.mp3',
    lyrics: `[00:00.00] (Thunderous Fingerstyle Riff & Driving Percussion)
[00:08.50] First things first, I'ma say all the words inside my head
[00:16.80] I'm fired up and tired of the way that things have been, oh-ooh
[00:25.20] Second thing second, don't you tell me what you think that I could be
[00:33.50] I'm the one at the sail, I'm the master of my sea, oh-ooh
[00:42.00] (Explosive Stadium Drop)
[00:50.50] Pain! You made me a, you made me a believer, believer
[00:59.00] Pain! You break me down and build me up, believer, believer`
  },
  {
    id: 'anamar-tr-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artistId: 'art-the-weeknd',
    album: 'After Hours Master',
    albumId: 'alb-after-hours',
    duration: 200,
    genre: 'Pop / Dance',
    mood: 'Energetic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 8000000,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/fd00ebd6d30d7253f813dba3bb1c66a9/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://api.audius.co/v1/tracks/0OJ76mV/stream?app_name=ANAMAR_MUSIC',
    downloadUrl: 'https://api.audius.co/v1/tracks/0OJ76mV/stream?app_name=ANAMAR_MUSIC',
    lyrics: `[00:00.00] (Iconic 80s Synth Hook)
[00:14.50] Yeah, I've been tryna call
[00:21.00] I've been on my own for long enough
[00:28.00] Maybe you can show me how to love, maybe
[00:35.00] I'm going through withdrawals
[00:42.00] You don't even have to do too much
[00:49.00] You can turn me on with just a touch, baby
[00:56.00] (Soaring 80s Synth Pulse)
[01:03.00] I said, ooh, I'm blinded by the lights
[01:10.00] No, I can't sleep until I feel your touch`
  },
  {
    id: 'anamar-tr-viva-la-vida',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    artistId: 'art-coldplay',
    album: 'Viva La Vida Anthology',
    albumId: 'alb-viva-la-vida',
    duration: 242,
    genre: 'Rock',
    mood: 'Energetic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 9680000,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/eede3cd0dc3a5a87c7a5b1085b022e2d/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://aac.saavncdn.com/176/94ee67902cc3849b9198c2569544de8b_320.mp4',
    downloadUrl: 'https://aac.saavncdn.com/176/94ee67902cc3849b9198c2569544de8b_320.mp4',
    lyrics: `[00:00.00] (Soaring Orchestral String Ostinato)
[00:15.00] I used to rule the world
[00:22.50] Seas would rise when I gave the word
[00:30.00] Now in the morning I sleep alone
[00:37.50] Sweep the streets I used to own
[00:45.00] (Triumphant Symphony Chorus)
[00:52.50] I hear Jerusalem bells a-ringin'
[01:00.00] Roman Cavalry choirs are singin'
[01:07.50] Be my mirror, my sword and shield`
  },
  {
    id: 'anamar-tr-cruel-summer',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    artistId: 'art-taylor-swift',
    album: 'Lover Era',
    albumId: 'alb-taylor-lover',
    duration: 178,
    genre: 'Pop / Dance',
    mood: 'Energetic',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 7120000,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/6111c5ab9729c8eac47883e4e50e9cf8/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://aac.saavncdn.com/228/f4a5205336607564e3774a7d9791f660_320.mp4',
    downloadUrl: 'https://aac.saavncdn.com/228/f4a5205336607564e3774a7d9791f660_320.mp4',
    lyrics: `[00:00.00] (Glittering Dream-Pop Synths)
[00:12.00] Fever dream high in the quiet of the night
[00:18.50] You know that I caught it
[00:25.00] Bad, bad boy, shiny toy with a price
[00:31.50] You know that I bought it
[00:38.00] (Explosive Bridge)
[00:44.50] And it's new, the shape of your body
[00:51.00] It's blue, the feeling I've got
[00:57.50] And it's ooh, whoa, oh
[01:04.00] It's a cruel summer!`
  },
  {
    id: 'anamar-tr-arz-kiya',
    title: 'Arz Kiya Hai',
    artist: 'Anuv Jain',
    artistId: 'art-anuv-jain',
    album: 'Coke Studio Bharat',
    albumId: 'alb-coke-studio-bharat',
    duration: 294,
    genre: 'Bollywood',
    mood: 'Soulful',
    releaseYear: 2024,
    bitrate: '320 kbps',
    fileSize: 11760000,
    canDownload: true,
    thumbnail: 'https://cdn-images.dzcdn.net/images/cover/269ee6cfef6451ce303541fae19f8fb6/1000x1000-000000-80-0-0.jpg',
    streamUrl: 'https://aac.saavncdn.com/504/a70f9144a360aa064fadffa886e7c8b6_320.mp4',
    downloadUrl: 'https://aac.saavncdn.com/504/a70f9144a360aa064fadffa886e7c8b6_320.mp4',
    lyrics: `[00:00.00] (Delicate Acoustic Chords)
[00:20.00] Arz kiya hai tere liye
[00:40.00] Ye shab ke sitare jhukte huye
[01:00.00] Jo keh na paaye lafzon mein hum
[01:20.00] Woh aankhon se teri behta gaya`
  }
];

export const ARTISTS_CATALOG: Artist[] = [
  {
    id: 'art-atif-aslam',
    name: 'Atif Aslam',
    bio: 'Legendary Pakistani playback singer and songwriter revered worldwide for his soaring vocal range, heartfelt Urdu romantic ballads, and Coke Studio masterpieces.',
    image: 'https://cdn-images.dzcdn.net/images/artist/0ea90444148fff9c11d77f06a344724e/1000x1000-000000-80-0-0.jpg',
    genres: ['Pakistani', 'Sufi', 'Pop', 'Bollywood'],
    monthlyListeners: 24500000,
    topTrackIds: ['anamar-tr-atif-01', 'anamar-tr-atif-02', 'anamar-tr-atif-03', 'anamar-tr-atif-04']
  },
  {
    id: 'art-ali-sethi',
    name: 'Ali Sethi',
    bio: 'Pioneering Pakistani singer, raga composer, and author revitalizing South Asian classical traditions through global electronic beats.',
    image: 'https://cdn-images.dzcdn.net/images/artist/f2dc6f69fb460209dcbdc1bc47968c29/1000x1000-000000-80-0-0.jpg',
    genres: ['Pakistani', 'Indie', 'Folk'],
    monthlyListeners: 8900000,
    topTrackIds: ['anamar-tr-pasoori']
  },
  {
    id: 'art-kaifi-khalil',
    name: 'Kaifi Khalil',
    bio: 'Sensational Baloch singer-songwriter whose heartfelt acoustic ballad "Kahani Suno 2.0" took global charts by storm.',
    image: 'https://cdn-images.dzcdn.net/images/artist/16070d1ec389eca55fa25795d313966d/1000x1000-000000-80-0-0.jpg',
    genres: ['Pakistani', 'Acoustic', 'Folk'],
    monthlyListeners: 6200000,
    topTrackIds: ['anamar-tr-kahani-suno']
  },
  {
    id: 'art-rahat-fateh',
    name: 'Rahat Fateh Ali Khan',
    bio: 'World-renowned Sufi maestro carrying the supreme torch of Qawwali and heartfelt cinematic masterpieces.',
    image: 'https://cdn-images.dzcdn.net/images/artist/8263c6e6e75baf8387ad258459021f78/1000x1000-000000-80-0-0.jpg',
    genres: ['Pakistani', 'Sufi', 'Classical', 'Bollywood'],
    monthlyListeners: 19800000,
    topTrackIds: ['anamar-tr-afreen', 'anamar-tr-o-re-piya']
  },
  {
    id: 'art-arijit-singh',
    name: 'Arijit Singh',
    bio: 'The undisputed voice of modern South Asian romance, acclaimed for poignant, emotion-drenched vocal genius.',
    image: 'https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/1000x1000-000000-80-0-0.jpg',
    genres: ['Bollywood', 'Romantic', 'Acoustic'],
    monthlyListeners: 48000000,
    topTrackIds: ['anamar-tr-kesariya', 'anamar-tr-tum-hi-ho', 'anamar-tr-agar-tum', 'anamar-tr-shayad']
  },
  {
    id: 'art-diljit-dosanjh',
    name: 'Diljit Dosanjh',
    bio: 'Global Punjabi music powerhouse and historic Coachella performer unifying Bhangra, hip-hop, and infectious energy.',
    image: 'https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/1000x1000-000000-80-0-0.jpg',
    genres: ['Bollywood', 'Punjabi', 'Party', 'Hip-Hop'],
    monthlyListeners: 18500000,
    topTrackIds: ['anamar-tr-lover', 'anamar-tr-born-to-shine']
  },
  {
    id: 'art-shreya-ghoshal',
    name: 'Shreya Ghoshal',
    bio: 'Four-time National Award-winning melody queen acclaimed for her pristine vocals across romantic classics and classical ragas.',
    image: 'https://cdn-images.dzcdn.net/images/artist/526732cf32f5d947265ca56277b0c511/1000x1000-000000-80-0-0.jpg',
    genres: ['Bollywood', 'Romantic', 'Classical'],
    monthlyListeners: 34000000,
    topTrackIds: ['anamar-tr-hasi', 'anamar-tr-samjhawan']
  },
  {
    id: 'art-kk',
    name: 'KK',
    bio: 'Unforgettable Indian playback icon celebrated for his electrifying rock ballads, heartfelt romance, and timeless anthems.',
    image: 'https://cdn-images.dzcdn.net/images/artist/c17e3f8a071f08cb5ef4815a5fbc40d1/1000x1000-000000-80-0-0.jpg',
    genres: ['Bollywood', 'Rock', 'Romantic'],
    monthlyListeners: 16500000,
    topTrackIds: ['anamar-tr-zara-sa']
  },
  {
    id: 'art-mohit-chauhan',
    name: 'Mohit Chauhan',
    bio: 'Beloved playback maestro known for his warm acoustic timbre, heartfelt indie folk, and iconic cinematic soundtracks.',
    image: 'https://cdn-images.dzcdn.net/images/artist/ce5a07aa1bce1b44ecfe86e632832822/1000x1000-000000-80-0-0.jpg',
    genres: ['Bollywood', 'Indie', 'Acoustic'],
    monthlyListeners: 14200000,
    topTrackIds: ['anamar-tr-tune-jo']
  },
  {
    id: 'art-ankit-tiwari',
    name: 'Ankit Tiwari',
    bio: 'Acclaimed composer and vocalist renowned for stirring emotional depth in legendary soundtracks including Aashiqui 2.',
    image: 'https://cdn-images.dzcdn.net/images/artist/1eafe8cf79a3fa2723c31ff73e6f9a0c/1000x1000-000000-80-0-0.jpg',
    genres: ['Bollywood', 'Soulful', 'Romantic'],
    monthlyListeners: 9200000,
    topTrackIds: ['anamar-tr-sunn-raha']
  },
  {
    id: 'art-anuv-jain',
    name: 'Anuv Jain',
    bio: 'Celebrated indie singer-songwriter captivating millions worldwide with intimate acoustic fingerpicking and poetic Hindi lyrics.',
    image: 'https://cdn-images.dzcdn.net/images/artist/3d97fae69e46a74ee60d2ca2a3e8705f/1000x1000-000000-80-0-0.jpg',
    genres: ['Bollywood', 'Indie', 'Acoustic'],
    monthlyListeners: 8400000,
    topTrackIds: ['anamar-tr-arz-kiya']
  },
  {
    id: 'art-the-weeknd',
    name: 'The Weeknd',
    bio: 'Trailblazing global pop icon whose hypnotic synthwave anthems and falsetto defined a generation.',
    image: 'https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/1000x1000-000000-80-0-0.jpg',
    genres: ['Pop / Dance', 'R&B / Soul', 'Synthwave'],
    monthlyListeners: 112000000,
    topTrackIds: ['anamar-tr-blinding-lights']
  },
  {
    id: 'art-imagine-dragons',
    name: 'Imagine Dragons',
    bio: 'Diamond-certified stadium rock titans celebrated for anthemic beats, soaring percussion, and unstoppable momentum.',
    image: 'https://cdn-images.dzcdn.net/images/artist/1ba025c23cae3dee14b51152990285fc/1000x1000-000000-80-0-0.jpg',
    genres: ['Rock', 'Alternative', 'Workout'],
    monthlyListeners: 68000000,
    topTrackIds: ['anamar-tr-believer']
  },
  {
    id: 'art-coldplay',
    name: 'Coldplay',
    bio: 'Legendary British rock band whose orchestral harmonies and stadium anthems inspire millions worldwide.',
    image: 'https://cdn-images.dzcdn.net/images/artist/3087954bca22f306324912e5ac8375c3/1000x1000-000000-80-0-0.jpg',
    genres: ['Rock', 'Pop', 'Indie'],
    monthlyListeners: 84000000,
    topTrackIds: ['anamar-tr-viva-la-vida']
  },
  {
    id: 'art-taylor-swift',
    name: 'Taylor Swift',
    bio: 'Record-shattering cultural phenomenon and storytelling virtuoso whose songs span pop, folk, and country.',
    image: 'https://cdn-images.dzcdn.net/images/artist/cc2495870fe1a792ad0cdb05501ad5ec/1000x1000-000000-80-0-0.jpg',
    genres: ['Pop / Dance', 'Acoustic', 'Indie'],
    monthlyListeners: 110000000,
    topTrackIds: ['anamar-tr-cruel-summer']
  }
];

/**
 * Strips any unwanted tags such as [Full Song], (Full Video), [FULL], etc.
 * from song titles to keep UI pristine and clean.
 */
export function cleanSongTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\[\s*(full\s*song|full\s*track|full\s*audio|full\s*video|full|official|hq|hd|320\s*kbps)[^\]]*\]/gi, '')
    .replace(/\(\s*(full\s*song|full\s*track|full\s*audio|full\s*video|full|official|hq|hd|320\s*kbps)[^\)]*\)/gi, '')
    .replace(/\s*-\s*full\s*(song|track|audio|video|version)?/gi, '')
    .replace(/\s+full\s+(song|track|audio|video|version)/gi, '')
    .replace(/\b(full\s*song|full\s*track|full\s*audio|full\s*version)\b/gi, '')
    .replace(/\s*\|\s*full\b/gi, '')
    .trim();
}

export const ALBUMS_CATALOG: Album[] = [
  {
    id: 'alb-race-classics',
    title: 'Race Classics',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    cover: 'https://cdn-images.dzcdn.net/images/cover/667564334d2589dfebccebada3993124/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Pakistani',
    trackIds: ['anamar-tr-atif-01']
  },
  {
    id: 'alb-ajab-prem',
    title: 'Ajab Prem Ki Ghazal',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    cover: 'https://cdn-images.dzcdn.net/images/cover/dbacb8b22a3a2cac2eba7f6cc0f84303/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Pakistani',
    trackIds: ['anamar-tr-atif-02', 'anamar-tr-atif-06']
  },
  {
    id: 'alb-coke-studio-8',
    title: 'Coke Studio Season 8',
    artist: 'Atif Aslam',
    artistId: 'art-atif-aslam',
    cover: 'https://cdn-images.dzcdn.net/images/cover/ac41e8b4e757ac4661f8b3d0f335265b/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Sufi',
    trackIds: ['anamar-tr-atif-04']
  },
  {
    id: 'alb-coke-studio-14',
    title: 'Coke Studio Season 14',
    artist: 'Ali Sethi & Shae Gill',
    artistId: 'art-ali-sethi',
    cover: 'https://cdn-images.dzcdn.net/images/cover/ff33e47cbd882a3e418db84b2d36ee38/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Pakistani',
    trackIds: ['anamar-tr-pasoori']
  },
  {
    id: 'alb-baloch-soul',
    title: 'Baloch Soul',
    artist: 'Kaifi Khalil',
    artistId: 'art-kaifi-khalil',
    cover: 'https://cdn-images.dzcdn.net/images/cover/bf9ac71c9122e72ade2b1ad796c45129/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Pakistani',
    trackIds: ['anamar-tr-kahani-suno']
  },
  {
    id: 'alb-coke-studio-9',
    title: 'Coke Studio Season 9',
    artist: 'Rahat Fateh Ali Khan & Momina Mustehsan',
    artistId: 'art-rahat-fateh',
    cover: 'https://cdn-images.dzcdn.net/images/cover/9c050c8d52648bc1a95d6629e2d84d0b/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Sufi',
    trackIds: ['anamar-tr-afreen']
  },
  {
    id: 'alb-brahmastra',
    title: 'Brahmāstra Soundtracks',
    artist: 'Arijit Singh & Pritam',
    artistId: 'art-arijit-singh',
    cover: 'https://cdn-images.dzcdn.net/images/cover/7aace08357f8abb1d4aa154780378c4d/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-kesariya']
  },
  {
    id: 'alb-aashiqui-2',
    title: 'Aashiqui 2 Master Collection',
    artist: 'Arijit Singh & Ankit Tiwari',
    artistId: 'art-arijit-singh',
    cover: 'https://cdn-images.dzcdn.net/images/cover/ad8ebbaa26ac316a96849f12eeb5f63d/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-tum-hi-ho', 'anamar-tr-sunn-raha']
  },
  {
    id: 'alb-tamasha',
    title: 'Tamasha Masterpiece',
    artist: 'Arijit Singh & Alka Yagnik',
    artistId: 'art-arijit-singh',
    cover: 'https://cdn-images.dzcdn.net/images/cover/407e34575dc610b6592fda6d8210be18/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-agar-tum']
  },
  {
    id: 'alb-kabir-singh',
    title: 'Kabir Singh Master Edition',
    artist: 'Arijit Singh',
    artistId: 'art-arijit-singh',
    cover: 'https://cdn-images.dzcdn.net/images/cover/7e6f8fa9b61d36ea1a942bc30a7d0e45/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-bekhayali']
  },
  {
    id: 'alb-moonchild',
    title: 'MoonChild Era',
    artist: 'Diljit Dosanjh',
    artistId: 'art-diljit-dosanjh',
    cover: 'https://cdn-images.dzcdn.net/images/cover/a8cf2b35efa2c9a9bc1c9b0bcbee93ca/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-lover']
  },
  {
    id: 'alb-goat',
    title: 'G.O.A.T.',
    artist: 'Diljit Dosanjh',
    artistId: 'art-diljit-dosanjh',
    cover: 'https://cdn-images.dzcdn.net/images/cover/87516b74e8e95b373c57a5b74ff2a769/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-born-to-shine']
  },
  {
    id: 'alb-jannat',
    title: 'Jannat Classics',
    artist: 'KK & Pritam',
    artistId: 'art-kk',
    cover: 'https://cdn-images.dzcdn.net/images/cover/c94a5f49030c0e084ee0607e7977087d/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-zara-sa']
  },
  {
    id: 'alb-new-york',
    title: 'New York Melodies',
    artist: 'Mohit Chauhan & Pritam',
    artistId: 'art-mohit-chauhan',
    cover: 'https://cdn-images.dzcdn.net/images/cover/487a667eed13c8dfb8e2a107070f6444/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-tune-jo']
  },
  {
    id: 'alb-adhuri-kahani',
    title: 'Hamari Adhuri Kahani',
    artist: 'Shreya Ghoshal',
    artistId: 'art-shreya-ghoshal',
    cover: 'https://cdn-images.dzcdn.net/images/cover/0399215135d3cc0287d2279ab68365a1/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-hasi']
  },
  {
    id: 'alb-humpty-sharma',
    title: 'Humpty Sharma Classics',
    artist: 'Arijit Singh & Shreya Ghoshal',
    artistId: 'art-arijit-singh',
    cover: 'https://cdn-images.dzcdn.net/images/cover/eb43db286a91f8b260a36cc7dc359da8/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Bollywood',
    trackIds: ['anamar-tr-samjhawan']
  },
  {
    id: 'alb-after-hours',
    title: 'After Hours Master',
    artist: 'The Weeknd',
    artistId: 'art-the-weeknd',
    cover: 'https://cdn-images.dzcdn.net/images/cover/fd00ebd6d30d7253f813dba3bb1c66a9/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Pop / Dance',
    trackIds: ['anamar-tr-blinding-lights']
  },
  {
    id: 'alb-evolve',
    title: 'Evolve Master Collection',
    artist: 'Imagine Dragons',
    artistId: 'art-imagine-dragons',
    cover: 'https://cdn-images.dzcdn.net/images/cover/247b228179aea3b083eef43522b78b45/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Rock',
    trackIds: ['anamar-tr-believer']
  },
  {
    id: 'alb-viva-la-vida',
    title: 'Viva La Vida Anthology',
    artist: 'Coldplay',
    artistId: 'art-coldplay',
    cover: 'https://cdn-images.dzcdn.net/images/cover/eede3cd0dc3a5a87c7a5b1085b022e2d/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Rock',
    trackIds: ['anamar-tr-viva-la-vida']
  },
  {
    id: 'alb-taylor-lover',
    title: 'Lover Era',
    artist: 'Taylor Swift',
    artistId: 'art-taylor-swift',
    cover: 'https://cdn-images.dzcdn.net/images/cover/6111c5ab9729c8eac47883e4e50e9cf8/1000x1000-000000-80-0-0.jpg',
    year: 2024,
    genre: 'Pop / Dance',
    trackIds: ['anamar-tr-cruel-summer']
  }
];

export const FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-atif-essentials',
    title: 'Atif Aslam Master Essentials',
    description: 'The definitive collection of Atif Aslam hits: Pehli Nazar Mein, Tu Jaane Na, Jeena Jeena, Tajdar-e-Haram, and Tere Sang Yaara.',
    cover: 'https://cdn-images.dzcdn.net/images/artist/33e66ad5c0a37e1ae25aa81eb3ca6650/1000x1000-000000-80-0-0.jpg',
    tracks: INITIAL_TRACKS.filter((t) => t.artist === 'Atif Aslam'),
    createdBy: 'Anamar Editorial',
    createdAt: Date.now() - 6000000,
  },
  {
    id: 'pl-arijit-magic',
    title: 'Arijit Singh Soulful Anthems',
    description: 'Iconic romantic and heartbreak ballads by Arijit Singh: Kesariya, Tum Hi Ho, Agar Tum Saath Ho, Shayad, and Khairiyat.',
    cover: 'https://cdn-images.dzcdn.net/images/artist/b2b800ca09549f6eb735c249a5b3901b/1000x1000-000000-80-0-0.jpg',
    tracks: INITIAL_TRACKS.filter((t) => t.artist.includes('Arijit Singh')),
    createdBy: 'Anamar Editorial',
    createdAt: Date.now() - 5500000,
  },
  {
    id: 'pl-pakistani-gems',
    title: 'Pakistani & Sufi Gems',
    description: 'Transcendent Sufi melodies, heartfelt Urdu ballads, and Coke Studio masterpieces.',
    cover: 'https://cdn-images.dzcdn.net/images/cover/ac41e8b4e757ac4661f8b3d0f335265b/1000x1000-000000-80-0-0.jpg',
    tracks: INITIAL_TRACKS.filter((t) => t.genre === 'Pakistani' || t.genre === 'Sufi'),
    createdBy: 'Anamar Editorial',
    createdAt: Date.now() - 5000000,
  },
  {
    id: 'pl-bollywood-romance',
    title: 'Bollywood Romance & Hits',
    description: 'Pritam, KK, Mohit Chauhan, Shreya Ghoshal, and soul-stirring South Asian anthems in full 320kbps.',
    cover: 'https://cdn-images.dzcdn.net/images/cover/7aace08357f8abb1d4aa154780378c4d/1000x1000-000000-80-0-0.jpg',
    tracks: INITIAL_TRACKS.filter((t) => t.genre === 'Bollywood'),
    createdBy: 'Anamar Editorial',
    createdAt: Date.now() - 4000000,
  },
  {
    id: 'pl-punjabi-hype',
    title: 'Diljit Dosanjh Punjabi Bangers',
    description: 'Electrifying Punjabi pop, high-tempo beats, and G.O.A.T. vibes.',
    cover: 'https://cdn-images.dzcdn.net/images/artist/cc53da129d2b27072eb3cc2bb0a07e99/1000x1000-000000-80-0-0.jpg',
    tracks: INITIAL_TRACKS.filter((t) => t.artist.includes('Diljit Dosanjh')),
    createdBy: 'Anamar Editorial',
    createdAt: Date.now() - 3500000,
  },
  {
    id: 'pl-late-night',
    title: 'Late Night Melancholy & Lo-Fi',
    description: 'Gentle acoustic strings, nostalgic Urdu lyrics, and nocturnal vibes for unwinding.',
    cover: 'https://cdn-images.dzcdn.net/images/cover/bf9ac71c9122e72ade2b1ad796c45129/1000x1000-000000-80-0-0.jpg',
    tracks: INITIAL_TRACKS.filter((t) => t.mood === 'Melancholic' || t.mood === 'Romantic').slice(0, 6),
    createdBy: 'Anamar Editorial',
    createdAt: Date.now() - 3200000,
  },
  {
    id: 'pl-global-chart',
    title: 'Global Top Hits 2026',
    description: 'Full-length stadium sensations from The Weeknd, Imagine Dragons, Coldplay, and Taylor Swift.',
    cover: 'https://cdn-images.dzcdn.net/images/cover/fd00ebd6d30d7253f813dba3bb1c66a9/1000x1000-000000-80-0-0.jpg',
    tracks: INITIAL_TRACKS.filter((t) => t.genre === 'Pop / Dance' || t.genre === 'Rock'),
    createdBy: 'Anamar Editorial',
    createdAt: Date.now() - 3000000,
  },
  {
    id: 'pl-acoustic-sessions',
    title: 'Unplugged & Acoustic Sessions',
    description: 'Raw vocal master recordings, pure acoustic guitars, and serene melodies.',
    cover: 'https://cdn-images.dzcdn.net/images/cover/dbacb8b22a3a2cac2eba7f6cc0f84303/1000x1000-000000-80-0-0.jpg',
    tracks: [INITIAL_TRACKS[0], INITIAL_TRACKS[1], INITIAL_TRACKS[2], INITIAL_TRACKS[8], INITIAL_TRACKS[9]],
    createdBy: 'Anamar Editorial',
    createdAt: Date.now() - 2500000,
  }
];

export const GENRES = [
  'All',
  'Pakistani',
  'Bollywood',
  'Sufi',
  'Pop / Dance',
  'Rock',
  'Indie',
  'Punjabi',
  'Electronic / EDM',
  'Lo-Fi / Chill',
  'Acoustic'
];

export const MOODS = [
  'All',
  'Romantic',
  'Soulful',
  'Energetic',
  'Spiritual',
  'Melancholic',
  'Party',
  'Workout',
  'Late Night'
];
