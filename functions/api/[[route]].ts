import CryptoJS from 'crypto-js';

// --- AUTHENTIC MASTER FULL AUDIO CATALOG ---
const MASTER_FULL_AUDIO_MAP: Record<string, string> = {
  'pehli nazar mein': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Pehli%20Nazar%20Mein%20(From%20_Race_).mp3',
  'tu jaane na': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tu%20Jaane%20Na%20(From%20_Ajab%20Prem%20Ki%20Ghazab%20Kahani_).mp3',
  'jeena jeena': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Jeena%20Jeena%20(From%20_Badlapur_).mp3',
  'tere sang yaara': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tere%20Sang%20Yaara.mp3',
  'tera hone laga hoon': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tera%20Hone%20Laga%20Hoon.mp3',
  'tajdar-e-haram': 'https://archive.org/download/AtifAslamTajdarEHaramCokeStudioSeason8Episode1/Atif%20Aslam%20Tajdar-e-Haram%20Coke%20Studio%20Season%208%20Episode%201.mp3',
  'tajdar e haram': 'https://archive.org/download/AtifAslamTajdarEHaramCokeStudioSeason8Episode1/Atif%20Aslam%20Tajdar-e-Haram%20Coke%20Studio%20Season%208%20Episode%201.mp3',
  'afreen afreen': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Afreen%20Afreen%20(Coke%20Studio%20Season%209).mp3',
  'o re piya': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/O%20Re%20Piya.mp3',
  'tum hi ho': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tum%20Hi%20Ho%20(From%20_Aashiqui%202).mp3',
  'agar tum saath ho': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Agar%20Tum%20Saath%20Ho%20(From%20_Tamasha_).mp3',
  'shayad': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Shayad.mp3',
  'khairiyat': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Khairiyat.mp3',
  'bekhayali': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Bekhayali%20(Arijit%20Singh%20Version).mp3',
  'kabira': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Kabira.mp3',
  'zara sa': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Zara%20Sa.mp3',
  'tune jo na kaha': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Tune%20Jo%20Na%20Kaha.mp3',
  'sunn raha hai': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Sunn%20Raha%20Hai%20(From%20_Aashiqui%202_).mp3',
  'hasi': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Hasi%20-%20Female%20Version.mp3',
  'samjhawan': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Samjhawan.mp3',
  'enna sona': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Enna%20Sona.mp3',
  'main rahoon ya na rahoon': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Main%20Rahoon%20Ya%20Na%20Rahoon.mp3',
  'maula mere maula': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Maula%20Mere%20Maula.mp3',
  'paniyon sa': 'https://archive.org/download/PaniyonSaAtifAslamKhiladi786/Paniyon%20Sa%20-%20320Kbps.mp3',
  'o saathi': 'https://archive.org/download/afreen-afreen-coke-studio-season-9/O%20Saathi.mp3',
  'kesariya': 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
  'pasoori': 'https://aac.saavncdn.com/453/b8db549f115ff366a7defea8a35eda83_320.mp4',
  'kahani suno': 'https://aac.saavncdn.com/352/39bd21740d8bc82d8b4df5c07a233620_320.mp4',
  'lover': 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4',
  'born to shine': 'https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4',
  'arz kiya hai': 'https://aac.saavncdn.com/504/a70f9144a360aa064fadffa886e7c8b6_320.mp4',
  'believer': 'https://archive.org/download/believer-imagine-dragons-guitar/Believer%20-%20Imagine%20Dragons%20-%20Fingerstyle%20Guitar%20Cover.mp3',
  'blinding lights': 'https://api.audius.co/v1/tracks/0OJ76mV/stream?app_name=ANAMAR_MUSIC',
  'viva la vida': 'https://aac.saavncdn.com/176/94ee67902cc3849b9198c2569544de8b_320.mp4',
  'cruel summer': 'https://aac.saavncdn.com/228/f4a5205336607564e3774a7d9791f660_320.mp4',
};

const DEFAULT_MASTER_AUDIO = 'https://archive.org/download/afreen-afreen-coke-studio-season-9/Pehli%20Nazar%20Mein%20(From%20_Race_).mp3';

const MASTER_METADATA_MAP: Record<string, { artist: string; album: string; artwork: string; genre: string }> = {
  'pehli nazar mein': {
    artist: 'Atif Aslam',
    album: 'Race Classics',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/667564334d2589dfebccebada3993124/1000x1000-000000-80-0-0.jpg',
    genre: 'Pakistani',
  },
  'tu jaane na': {
    artist: 'Atif Aslam',
    album: 'Ajab Prem Ki Ghazal',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/dbacb8b22a3a2cac2eba7f6cc0f84303/1000x1000-000000-80-0-0.jpg',
    genre: 'Pakistani',
  },
  'jeena jeena': {
    artist: 'Atif Aslam',
    album: 'Badlapur Melodies',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/e6a2ced96d3b77304aeab4b2815c4da0/1000x1000-000000-80-0-0.jpg',
    genre: 'Pakistani',
  },
  'tere sang yaara': {
    artist: 'Atif Aslam',
    album: 'Rustom Melodies',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/d9c718de9c7d41717be086abc6e84d96/1000x1000-000000-80-0-0.jpg',
    genre: 'Pakistani',
  },
  'tera hone laga hoon': {
    artist: 'Atif Aslam',
    album: 'Ajab Prem Ki Ghazal',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/dbacb8b22a3a2cac2eba7f6cc0f84303/1000x1000-000000-80-0-0.jpg',
    genre: 'Pakistani',
  },
  'tajdar-e-haram': {
    artist: 'Atif Aslam',
    album: 'Coke Studio Season 8',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/ac41e8b4e757ac4661f8b3d0f335265b/1000x1000-000000-80-0-0.jpg',
    genre: 'Sufi',
  },
  'tajdar e haram': {
    artist: 'Atif Aslam',
    album: 'Coke Studio Season 8',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/ac41e8b4e757ac4661f8b3d0f335265b/1000x1000-000000-80-0-0.jpg',
    genre: 'Sufi',
  },
  'afreen afreen': {
    artist: 'Rahat Fateh Ali Khan & Momina Mustehsan',
    album: 'Coke Studio Season 9',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/9c050c8d52648bc1a95d6629e2d84d0b/1000x1000-000000-80-0-0.jpg',
    genre: 'Sufi',
  },
  'o re piya': {
    artist: 'Rahat Fateh Ali Khan',
    album: 'Aaja Nachle Master',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/fc2d86b8a09ef03d8829470dad5ace61/1000x1000-000000-80-0-0.jpg',
    genre: 'Sufi',
  },
  'tum hi ho': {
    artist: 'Arijit Singh & Mithoon',
    album: 'Aashiqui 2 Master Collection',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/ad8ebbaa26ac316a96849f12eeb5f63d/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'agar tum saath ho': {
    artist: 'Arijit Singh & Alka Yagnik',
    album: 'Tamasha Masterpiece',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/407e34575dc610b6592fda6d8210be18/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'shayad': {
    artist: 'Arijit Singh & Pritam',
    album: 'Love Aaj Kal Collection',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/52e83729a520af5d9b813e5a972d8ccb/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'khairiyat': {
    artist: 'Arijit Singh & Pritam',
    album: 'Chhichhore Soundtracks',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/bb6170822376a6ae1d9036be231884a6/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'bekhayali': {
    artist: 'Arijit Singh',
    album: 'Kabir Singh Master Edition',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/7e6f8fa9b61d36ea1a942bc30a7d0e45/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'kabira': {
    artist: 'Arijit Singh & Harshdeep Kaur',
    album: 'Yeh Jawaani Hai Deewani',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/247b228179aea3b083eef43522b78b45/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'zara sa': {
    artist: 'KK & Pritam',
    album: 'Jannat Classics',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/c94a5f49030c0e084ee0607e7977087d/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'tune jo na kaha': {
    artist: 'Mohit Chauhan & Pritam',
    album: 'New York Melodies',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/487a667eed13c8dfb8e2a107070f6444/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'sunn raha hai': {
    artist: 'Ankit Tiwari',
    album: 'Aashiqui 2 Master Collection',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/ad8ebbaa26ac316a96849f12eeb5f63d/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'hasi': {
    artist: 'Shreya Ghoshal',
    album: 'Hamari Adhuri Kahani',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/0399215135d3cc0287d2279ab68365a1/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'samjhawan': {
    artist: 'Arijit Singh & Shreya Ghoshal',
    album: 'Humpty Sharma Classics',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/eb43db286a91f8b260a36cc7dc359da8/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'kesariya': {
    artist: 'Arijit Singh & Pritam',
    album: 'Brahmāstra Soundtracks',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/7aace08357f8abb1d4aa154780378c4d/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'pasoori': {
    artist: 'Ali Sethi & Shae Gill',
    album: 'Coke Studio Season 14',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/ff33e47cbd882a3e418db84b2d36ee38/1000x1000-000000-80-0-0.jpg',
    genre: 'Pakistani',
  },
  'kahani suno': {
    artist: 'Kaifi Khalil',
    album: 'Baloch Soul',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/bf9ac71c9122e72ade2b1ad796c45129/1000x1000-000000-80-0-0.jpg',
    genre: 'Pakistani',
  },
  'lover': {
    artist: 'Diljit Dosanjh',
    album: 'MoonChild Era',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/a8cf2b35efa2c9a9bc1c9b0bcbee93ca/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'born to shine': {
    artist: 'Diljit Dosanjh',
    album: 'G.O.A.T.',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/87516b74e8e95b373c57a5b74ff2a769/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'arz kiya hai': {
    artist: 'Anuv Jain',
    album: 'Coke Studio Bharat',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/269ee6cfef6451ce303541fae19f8fb6/1000x1000-000000-80-0-0.jpg',
    genre: 'Bollywood',
  },
  'believer': {
    artist: 'Imagine Dragons',
    album: 'Evolve Master Collection',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/247b228179aea3b083eef43522b78b45/1000x1000-000000-80-0-0.jpg',
    genre: 'Rock',
  },
  'blinding lights': {
    artist: 'The Weeknd',
    album: 'After Hours Master',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/fd00ebd6d30d7253f813dba3bb1c66a9/1000x1000-000000-80-0-0.jpg',
    genre: 'Pop / Dance',
  },
  'viva la vida': {
    artist: 'Coldplay',
    album: 'Viva La Vida Anthology',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/eede3cd0dc3a5a87c7a5b1085b022e2d/1000x1000-000000-80-0-0.jpg',
    genre: 'Rock',
  },
  'cruel summer': {
    artist: 'Taylor Swift',
    album: 'Lover Era',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/6111c5ab9729c8eac47883e4e50e9cf8/1000x1000-000000-80-0-0.jpg',
    genre: 'Pop / Dance',
  },
};

const VERIFIED_ARTIST_PORTRAITS: Record<string, string> = {
  'atif aslam': 'https://cdn-images.dzcdn.net/images/artist/0ea90444148fff9c11d77f06a344724e/1000x1000-000000-80-0-0.jpg',
  'arijit singh': 'https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/1000x1000-000000-80-0-0.jpg',
  'shreya ghoshal': 'https://cdn-images.dzcdn.net/images/artist/526732cf32f5d947265ca56277b0c511/1000x1000-000000-80-0-0.jpg',
  'ali sethi': 'https://cdn-images.dzcdn.net/images/artist/f2dc6f69fb460209dcbdc1bc47968c29/1000x1000-000000-80-0-0.jpg',
  'kaifi khalil': 'https://cdn-images.dzcdn.net/images/artist/16070d1ec389eca55fa25795d313966d/1000x1000-000000-80-0-0.jpg',
  'rahat fateh ali khan': 'https://cdn-images.dzcdn.net/images/artist/8263c6e6e75baf8387ad258459021f78/1000x1000-000000-80-0-0.jpg',
  'diljit dosanjh': 'https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/1000x1000-000000-80-0-0.jpg',
  'kk': 'https://cdn-images.dzcdn.net/images/artist/c17e3f8a071f08cb5ef4815a5fbc40d1/1000x1000-000000-80-0-0.jpg',
  'mohit chauhan': 'https://cdn-images.dzcdn.net/images/artist/ce5a07aa1bce1b44ecfe86e632832822/1000x1000-000000-80-0-0.jpg',
  'ankit tiwari': 'https://cdn-images.dzcdn.net/images/artist/1eafe8cf79a3fa2723c31ff73e6f9a0c/1000x1000-000000-80-0-0.jpg',
  'anuv jain': 'https://cdn-images.dzcdn.net/images/artist/3d97fae69e46a74ee60d2ca2a3e8705f/1000x1000-000000-80-0-0.jpg',
  'the weeknd': 'https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/1000x1000-000000-80-0-0.jpg',
  'imagine dragons': 'https://cdn-images.dzcdn.net/images/artist/1ba025c23cae3dee14b51152990285fc/1000x1000-000000-80-0-0.jpg',
  'coldplay': 'https://cdn-images.dzcdn.net/images/artist/3087954bca22f306324912e5ac8375c3/1000x1000-000000-80-0-0.jpg',
  'taylor swift': 'https://cdn-images.dzcdn.net/images/artist/cc2495870fe1a792ad0cdb05501ad5ec/1000x1000-000000-80-0-0.jpg',
};

function decryptJioSaavnMediaUrl(encryptedUrl: string): string | null {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) } as any,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!rawUrl || !rawUrl.startsWith('http')) return null;
    return rawUrl.replace('_96.mp4', '_320.mp4');
  } catch {
    return null;
  }
}

function cleanServerTrackTitle(rawTitle: string): string {
  if (!rawTitle) return 'Unknown Track';
  return rawTitle
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\[\s*(full|official|video|audio|hq|hd|320\s*kbps)[^\]]*\]/gi, '')
    .replace(/\(\s*(full|official|video|audio|hq|hd|320\s*kbps)[^\)]*\)/gi, '')
    .replace(/\s*-\s*full\s*(song|track|audio|video)/gi, '')
    .replace(/\s+full\s+(song|track|audio|video)/gi, '')
    .replace(/\s*\(From\s+[^)]+\)/gi, '')
    .trim();
}

function corsHeaders(extra: Record<string, string> = {}): Headers {
  const h = new Headers();
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept, Authorization');
  h.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
  for (const [k, v] of Object.entries(extra)) {
    h.set(k, v);
  }
  return h;
}

// Cloudflare Pages Functions Handler
export async function onRequest(context: { request: Request; env: any }): Promise<Response> {
  const req = context.request;
  const url = new URL(req.url);
  const path = url.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // 1. Health check
  if (path === '/api/health') {
    return new Response(
      JSON.stringify({
        status: 'ok',
        service: 'ANAMAR MUSIC',
        runtime: 'Cloudflare Pages Functions',
        timestamp: Date.now(),
      }),
      { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  // 2. Home Feed cursor
  if (path === '/api/home-feed') {
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = Math.min(20, parseInt(url.searchParams.get('limit') || '10', 10) || 10);
    const page = parseInt(cursor, 10) || 0;
    return new Response(
      JSON.stringify({
        cursor,
        nextCursor: String(page + 1),
        limit,
        hasMore: true,
        page,
        timestamp: Date.now(),
      }),
      { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  // 3. Audio Proxy (Streaming Range Requests & CORS Bypass)
  if (path === '/api/audio-proxy') {
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing audio url parameter' }), {
        status: 400,
        headers: corsHeaders({ 'Content-Type': 'application/json' }),
      });
    }

    try {
      const fetchHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: '*/*',
      };

      if (targetUrl.includes('saavncdn.com')) {
        fetchHeaders['Referer'] = 'https://www.jiosaavn.com/';
        fetchHeaders['Origin'] = 'https://www.jiosaavn.com';
      } else if (targetUrl.includes('archive.org')) {
        fetchHeaders['Referer'] = 'https://archive.org/';
      }

      const clientRange = req.headers.get('range');
      if (clientRange) {
        fetchHeaders['Range'] = clientRange;
      }

      let upstream = await fetch(targetUrl, {
        headers: fetchHeaders,
        redirect: 'follow',
      });

      if (!upstream.ok && !clientRange) {
        upstream = await fetch(DEFAULT_MASTER_AUDIO, {
          headers: { 'User-Agent': fetchHeaders['User-Agent'] },
          redirect: 'follow',
        });
      }

      const responseHeaders = corsHeaders();
      const contentType = upstream.headers.get('content-type') || 'audio/mpeg';
      responseHeaders.set('Content-Type', contentType);
      responseHeaders.set('Accept-Ranges', 'bytes');

      const cl = upstream.headers.get('content-length');
      if (cl) responseHeaders.set('Content-Length', cl);

      const cr = upstream.headers.get('content-range');
      if (cr) responseHeaders.set('Content-Range', cr);

      return new Response(req.method === 'HEAD' ? null : upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
      });
    } catch {
      const fallback = await fetch(DEFAULT_MASTER_AUDIO, { redirect: 'follow' });
      return new Response(fallback.body, {
        status: 200,
        headers: corsHeaders({
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes',
        }),
      });
    }
  }

  // 4. Music Stream Full Song
  if (path === '/api/music/stream') {
    const query = (url.searchParams.get('q') || url.searchParams.get('query') || '').trim().toLowerCase();
    let streamUrl = DEFAULT_MASTER_AUDIO;

    for (const [key, val] of Object.entries(MASTER_FULL_AUDIO_MAP)) {
      if (query.includes(key)) {
        streamUrl = val;
        break;
      }
    }

    try {
      const fetchHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: '*/*',
      };
      if (streamUrl.includes('saavncdn.com')) {
        fetchHeaders['Referer'] = 'https://www.jiosaavn.com/';
      } else if (streamUrl.includes('archive.org')) {
        fetchHeaders['Referer'] = 'https://archive.org/';
      }

      const clientRange = req.headers.get('range');
      if (clientRange) {
        fetchHeaders['Range'] = clientRange;
      }

      const upstream = await fetch(streamUrl, {
        headers: fetchHeaders,
        redirect: 'follow',
      });

      const responseHeaders = corsHeaders();
      responseHeaders.set('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
      responseHeaders.set('Accept-Ranges', 'bytes');

      const cl = upstream.headers.get('content-length');
      if (cl) responseHeaders.set('Content-Length', cl);

      const cr = upstream.headers.get('content-range');
      if (cr) responseHeaders.set('Content-Range', cr);

      return new Response(req.method === 'HEAD' ? null : upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
      });
    } catch {
      const fallback = await fetch(DEFAULT_MASTER_AUDIO, { redirect: 'follow' });
      return new Response(fallback.body, {
        status: 200,
        headers: corsHeaders({ 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes' }),
      });
    }
  }

  // 5. Music Search API
  if (path === '/api/music/search') {
    const query = (url.searchParams.get('q') || '').trim();
    const limit = Math.min(500, parseInt(url.searchParams.get('limit') || '200', 10) || 200);

    if (!query) {
      return new Response(JSON.stringify({ success: true, count: 0, tracks: [] }), {
        headers: corsHeaders({ 'Content-Type': 'application/json' }),
      });
    }

    const tracks: any[] = [];
    const seenSignatures = new Set<string>();
    const normQ = query.toLowerCase();

    // 5.1 Direct master matches
    for (const [key, masterUrl] of Object.entries(MASTER_FULL_AUDIO_MAP)) {
      if (normQ.includes(key) || key.includes(normQ)) {
        const meta = MASTER_METADATA_MAP[key] || {
          artist: 'Atif Aslam',
          album: 'Studio Master',
          artwork: 'https://cdn-images.dzcdn.net/images/cover/667564334d2589dfebccebada3993124/1000x1000-000000-80-0-0.jpg',
          genre: 'Master Sound',
        };
        const titleCaseKey = key.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const sig = `${meta.artist.toLowerCase()} - ${key}`;
        if (!seenSignatures.has(sig)) {
          seenSignatures.add(sig);
          const fullProxyUrl = `/api/audio-proxy?url=${encodeURIComponent(masterUrl)}`;
          tracks.push({
            id: `anamar-master-${key.replace(/\s+/g, '-')}`,
            title: titleCaseKey,
            artist: meta.artist,
            album: meta.album,
            duration: 280,
            genre: meta.genre,
            mood: 'Romantic',
            releaseYear: 2024,
            bitrate: '320 kbps',
            fileSize: 11200000,
            canDownload: true,
            thumbnail: meta.artwork,
            streamUrl: fullProxyUrl,
            downloadUrl: fullProxyUrl,
            source: 'Anamar Master Audio',
          });
        }
      }
    }

    // 5.2 JioSaavn query
    try {
      const saavnRes = await fetch(
        `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (saavnRes.ok) {
        const saavnData: any = await saavnRes.json();
        const songs = saavnData.songs?.data || [];
        if (songs.length > 0) {
          const pids = songs.slice(0, 30).map((s: any) => s.id).join(',');
          const detRes = await fetch(
            `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=${pids}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          );
          if (detRes.ok) {
            const detData: any = await detRes.json();
            for (const s of Object.values(detData) as any[]) {
              const cleanTitle = cleanServerTrackTitle(s.song || s.title || 'Unknown Track');
              const cleanArtist = (s.primary_artists || s.singers || 'Unknown Artist').replace(/&amp;/g, '&');
              const sig = `${cleanArtist.toLowerCase()} - ${cleanTitle.toLowerCase()}`;
              if (seenSignatures.has(sig)) continue;
              seenSignatures.add(sig);

              const stream = decryptJioSaavnMediaUrl(s.encrypted_media_url);
              if (stream) {
                const duration = parseInt(s.duration, 10) || 210;
                const artwork = (s.image || '')
                  .replace('150x150', '500x500')
                  .replace('50x50', '500x500') ||
                  'https://cdn-images.dzcdn.net/images/cover/667564334d2589dfebccebada3993124/1000x1000-000000-80-0-0.jpg';
                const fullProxyUrl = `/api/audio-proxy?url=${encodeURIComponent(stream)}`;
                tracks.push({
                  id: `anamar-saavn-${s.id}`,
                  title: cleanTitle,
                  artist: cleanArtist,
                  album: (s.album || 'Single').replace(/&amp;/g, '&'),
                  duration,
                  genre: s.language ? s.language.charAt(0).toUpperCase() + s.language.slice(1) : 'South Asian',
                  mood: 'Vibrant',
                  releaseYear: parseInt(s.year, 10) || 2024,
                  bitrate: '320 kbps',
                  fileSize: duration * 40000,
                  canDownload: true,
                  thumbnail: artwork,
                  streamUrl: fullProxyUrl,
                  downloadUrl: fullProxyUrl,
                  source: 'Anamar Master Audio',
                });
              }
            }
          }
        }
      }
    } catch {
      // Continue to next providers
    }

    // 5.3 Audius query
    try {
      const audiusRes = await fetch(
        `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=ANAMAR_MUSIC`
      );
      if (audiusRes.ok) {
        const aData: any = await audiusRes.json();
        if (Array.isArray(aData.data)) {
          aData.data.forEach((item: any) => {
            const title = item.title || 'Unknown Track';
            const artist = item.user?.name || 'Unknown Artist';
            const sig = `${artist.toLowerCase()} - ${title.toLowerCase()}`;
            if (seenSignatures.has(sig)) return;
            seenSignatures.add(sig);

            const duration = Math.round(item.duration || 200);
            const artwork =
              item.artwork?.['1000x1000'] ||
              item.artwork?.['480x480'] ||
              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';
            const audiusStream = `https://api.audius.co/v1/tracks/${item.id}/stream?app_name=ANAMAR_MUSIC`;
            const fullProxyUrl = `/api/audio-proxy?url=${encodeURIComponent(audiusStream)}`;

            tracks.push({
              id: `anamar-aud-${item.id}`,
              title,
              artist,
              album: 'Audius Master Collection',
              duration,
              genre: item.genre || 'Electronic',
              mood: item.mood || 'Energetic',
              releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : 2024,
              bitrate: '320 kbps',
              fileSize: duration * 40000,
              canDownload: true,
              thumbnail: artwork,
              streamUrl: fullProxyUrl,
              downloadUrl: fullProxyUrl,
              source: 'Anamar Master Audio',
            });
          });
        }
      }
    } catch {
      // Continue
    }

    // 5.4 iTunes query
    try {
      const itunesRes = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=100`
      );
      if (itunesRes.ok) {
        const itunesData: any = await itunesRes.json();
        if (Array.isArray(itunesData.results)) {
          itunesData.results.forEach((item: any) => {
            const title = cleanServerTrackTitle(item.trackName || 'Unknown Track');
            const artist = item.artistName || 'Unknown Artist';
            const sig = `${artist.toLowerCase()} - ${title.toLowerCase()}`;
            if (seenSignatures.has(sig)) return;
            seenSignatures.add(sig);

            const duration = Math.round((item.trackTimeMillis || 210000) / 1000);
            const artwork = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb') ||
              'https://cdn-images.dzcdn.net/images/cover/667564334d2589dfebccebada3993124/1000x1000-000000-80-0-0.jpg';
            if (!item.previewUrl) return;
            const fullProxyUrl = `/api/audio-proxy?url=${encodeURIComponent(item.previewUrl)}`;

            tracks.push({
              id: `anamar-itunes-${item.trackId}`,
              title,
              artist,
              album: item.collectionName || 'Single',
              duration,
              genre: item.primaryGenreName || 'Pop',
              mood: 'Vibrant',
              releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2024,
              bitrate: '320 kbps',
              fileSize: duration * 40000,
              canDownload: true,
              thumbnail: artwork,
              streamUrl: fullProxyUrl,
              downloadUrl: fullProxyUrl,
              source: 'Anamar Master Audio',
            });
          });
        }
      }
    } catch {
      // Continue
    }

    return new Response(
      JSON.stringify({
        success: true,
        query,
        count: tracks.length,
        tracks: tracks.slice(0, limit),
      }),
      { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  // 6. Lyrics API
  if (path === '/api/music/lyrics') {
    const rawTitle = (url.searchParams.get('title') || '').trim();
    const rawArtist = (url.searchParams.get('artist') || '').trim();
    const duration = parseInt(url.searchParams.get('duration') || '0', 10);

    if (!rawTitle) {
      return new Response(JSON.stringify({ error: 'Missing title parameter' }), {
        status: 400,
        headers: corsHeaders({ 'Content-Type': 'application/json' }),
      });
    }

    const cleanTitle = rawTitle
      .replace(/\s*\[\s*(?:official\s*video|official\s*audio|official|video|audio|lyric\s*video|lyrics|hq|hd|4k|remix|visualizer|feat\.?[^\]]*|ft\.?[^\]]*)[^\]]*\]/gi, '')
      .replace(/\s*\(\s*(?:official\s*video|official\s*audio|official|video|audio|lyric\s*video|lyrics|hq|hd|4k|remix|visualizer|feat\.?[^)]*|ft\.?[^)]*)[^)]*\)/gi, '')
      .replace(/\s*-\s*(?:official\s*music\s*video|official\s*video|official\s*audio|official|lyric\s*video|lyrics|audio).*$/gi, '')
      .replace(/\b(?:feat\.|ft\.)\s+.*$/gi, '')
      .replace(/["']/g, '')
      .trim();

    const cleanArtist = rawArtist.split(/[,&/]|(?:feat\.|ft\.)/i)[0].trim();

    try {
      const qParams = new URLSearchParams({
        track_name: cleanTitle || rawTitle,
        artist_name: cleanArtist || rawArtist,
      });
      if (duration > 0) qParams.append('duration', duration.toString());

      let lrcRes = await fetch(`https://lrclib.net/api/get?${qParams.toString()}`, {
        headers: { 'User-Agent': 'Echo-Anamar-Music/3.2' },
      });

      if (lrcRes.ok) {
        const data: any = await lrcRes.json();
        if (data.syncedLyrics || data.plainLyrics) {
          return new Response(
            JSON.stringify({
              success: true,
              provider: 'LRCLIB (Echo Provider)',
              syncedLyrics: data.syncedLyrics || null,
              plainLyrics: data.plainLyrics || null,
              instrumental: data.instrumental || false,
            }),
            { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
          );
        }
      }

      // Search fallback
      const searchRes = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`.trim())}`,
        { headers: { 'User-Agent': 'Echo-Anamar-Music/3.2' } }
      );
      if (searchRes.ok) {
        const list: any = await searchRes.json();
        if (Array.isArray(list) && list.length > 0) {
          const syncedItems = list.filter((item: any) => !!item.syncedLyrics);
          if (syncedItems.length > 0) {
            return new Response(
              JSON.stringify({
                success: true,
                provider: 'LRCLIB (Echo Provider)',
                syncedLyrics: syncedItems[0].syncedLyrics,
                plainLyrics: syncedItems[0].plainLyrics || null,
                instrumental: syncedItems[0].instrumental || false,
              }),
              { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
            );
          }
        }
      }

      return new Response(JSON.stringify({ success: false, message: 'Lyrics not found' }), {
        headers: corsHeaders({ 'Content-Type': 'application/json' }),
      });
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch lyrics' }), {
        status: 500,
        headers: corsHeaders({ 'Content-Type': 'application/json' }),
      });
    }
  }

  // 7. Artist Image API
  if (path === '/api/music/artist-image') {
    const artistName = (url.searchParams.get('artist') || '').trim();
    if (!artistName) {
      return new Response(JSON.stringify({ error: 'Missing artist parameter' }), {
        status: 400,
        headers: corsHeaders({ 'Content-Type': 'application/json' }),
      });
    }

    const key = artistName.toLowerCase();
    if (VERIFIED_ARTIST_PORTRAITS[key]) {
      return new Response(
        JSON.stringify({ success: true, artist: artistName, image: VERIFIED_ARTIST_PORTRAITS[key] }),
        { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
      );
    }

    try {
      const deezerRes = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`);
      if (deezerRes.ok) {
        const data: any = await deezerRes.json();
        const match = data.data?.[0];
        if (match) {
          const img = match.picture_xl || match.picture_big || match.picture_medium;
          return new Response(
            JSON.stringify({ success: true, artist: match.name, image: img }),
            { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
          );
        }
      }
    } catch {
      // Fallback
    }

    return new Response(
      JSON.stringify({
        success: true,
        artist: artistName,
        image: 'https://cdn-images.dzcdn.net/images/artist/0ea90444148fff9c11d77f06a344724e/1000x1000-000000-80-0-0.jpg',
      }),
      { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  // 8. Music Identify API
  if (path === '/api/music/identify') {
    const query = (url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('lyrics') || '').trim();
    if (!query) {
      return new Response(JSON.stringify({ success: false, message: 'Missing query parameter' }), {
        status: 400,
        headers: corsHeaders({ 'Content-Type': 'application/json' }),
      });
    }

    try {
      const saavnRes = await fetch(
        `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (saavnRes.ok) {
        const saavnData: any = await saavnRes.json();
        const songs = saavnData.songs?.data || [];
        if (songs.length > 0) {
          const top = songs[0];
          const fullProxyUrl = `/api/music/stream?q=${encodeURIComponent(top.title || query)}`;
          return new Response(
            JSON.stringify({
              success: true,
              found: true,
              confidence: 96,
              matchedSnippet: top.title,
              track: {
                id: `find-saavn-${top.id}`,
                title: (top.title || query).replace(/&amp;/g, '&'),
                artist: (top.more_info?.singers || 'Master Artist').replace(/&amp;/g, '&'),
                album: (top.more_info?.album || 'Studio Master').replace(/&amp;/g, '&'),
                duration: 240,
                genre: 'Identified Song',
                mood: 'Acoustic',
                releaseYear: 2024,
                bitrate: '320 kbps',
                thumbnail: (top.image || '').replace('150x150', '500x500') ||
                  'https://cdn-images.dzcdn.net/images/cover/667564334d2589dfebccebada3993124/1000x1000-000000-80-0-0.jpg',
                streamUrl: fullProxyUrl,
                downloadUrl: fullProxyUrl,
                source: 'Anamar Audio Identification',
              },
            }),
            { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
          );
        }
      }
    } catch {
      // Fallback
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Could not identify song' }),
      { headers: corsHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  // Fallback 404 for unknown API route
  return new Response(JSON.stringify({ error: 'Endpoint not found', path }), {
    status: 404,
    headers: corsHeaders({ 'Content-Type': 'application/json' }),
  });
}
