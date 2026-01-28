---
name: video-downloader
description: Download videos, audio, and playlists from 1000+ websites using yt-dlp. Use for - downloading videos from YouTube, Vimeo, Twitter, Bilibili, etc. - extracting audio from videos - downloading subtitles or transcripts - downloading entire playlists - saving videos at specific quality/resolution. Supports direct URLs and handles multiple formats, qualities, and metadata extraction.
---

# Video Downloader

## Quick Start

Check if yt-dlp is installed:
```bash
yt-dlp --version
```

If not installed:
```bash
pip install yt-dlp
```

Download a video:
```bash
python scripts/download_video.py "https://youtube.com/watch?v=VIDEO_ID"
```

## Core Features

### 1. Basic Video Download

Default downloads best quality video + audio merged as MP4:
```bash
python scripts/download_video.py "URL"
```

Videos save to `~/Downloads/videos/` by default.

### 2. Audio Only

Extract audio as M4A:
```bash
python scripts/download_video.py "URL" --audio-only
```

### 3. Subtitles

Download subtitles alongside video:
```bash
python scripts/download_video.py "URL" --subs
```

Embed subtitles into video:
```bash
python scripts/download_video.py "URL" --embed-subs
```

Supported languages: English, Chinese (Simplified/Traditional), Japanese, Korean.

### 4. Quality Selection

By resolution:
```bash
python scripts/download_video.py "URL" --quality 720   # 720p max
python scripts/download_video.py "URL" --quality 1080  # 1080p max
```

Custom format:
```bash
python scripts/download_video.py "URL" --format "bestvideo[height<=720]+bestaudio"
```

### 5. Playlists

Download entire playlist:
```bash
python scripts/download_video.py "PLAYLIST_URL" --playlist
```

Partial playlist:
```bash
python scripts/download_video.py "PLAYLIST_URL" --playlist --playlist-start 5 --playlist-end 10
```

### 6. Get Info Only

Extract metadata without downloading:
```bash
python scripts/download_video.py "URL" --json
```

Returns JSON with title, duration, uploader, views, upload date, thumbnail.

## Supported Sites

Popular sites include:
- YouTube (videos, shorts, playlists, channels)
- Bilibili
- Vimeo
- Twitter/X
- Instagram
- TikTok
- Twitch
- Facebook
- And 1000+ more

See yt-dlp documentation for full list.

## Script Options

| Option | Description |
|--------|-------------|
| `URL` | Video or playlist URL (required) |
| `-o, --output` | Output directory (default: `~/Downloads/videos`) |
| `-a, --audio-only` | Download audio only as M4A |
| `-s, --subs` | Download subtitles if available |
| `--embed-subs` | Embed subtitles into video file |
| `-p, --playlist` | Download entire playlist |
| `--playlist-start` | Playlist start index (default: 1) |
| `--playlist-end` | Playlist end index |
| `-f, --format` | Custom format selector |
| `--quality` | Target quality: 144/240/360/480/720/1080/1440/2160 |
| `--json` | Output metadata as JSON without downloading |

## Advanced Usage

See [references/options.md](references/options.md) for advanced yt-dlp format selectors and post-processing options.
