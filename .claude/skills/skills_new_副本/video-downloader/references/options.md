# Advanced yt-dlp Options

## Format Selectors

### Basic Formats

| Selector | Description |
|----------|-------------|
| `best` | Best quality format (single file) |
| `worst` | Worst quality format |
| `bestvideo+bestaudio` | Best video and audio, merged |
| `worstvideo+worstaudio` | Worst video and audio, merged |

### Quality Filters

```
bestvideo[height<=720]+bestaudio   # Max 720p
bestvideo[height<=1080]+bestaudio  # Max 1080p
bestvideo[height<=480][filesize<100M]+bestaudio  # Max 480p and <100MB
bestvideo[fps<=30]+bestaudio       # Max 30fps
bestvideo[vcodec^=avc1]+bestaudio # H.264 codec only
bestvideo[acodec!=none]            # Video with audio track
```

### Audio Only Formats

```
bestaudio/best                     # Best audio available
bestaudio[m4a]                     # Prefer M4A format
bestaudio[abr<=128]                # Max 128kbps bitrate
```

### Combining Selectors

```
(bestvideo[height<=1080]+bestaudio/best[height<=1080])/best  # 1080p or best
(bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a])/best     # H.264 + AAC
```

## Post-Processing Options

### Audio Conversion

```python
"postprocessors": [{
    "key": "FFmpegExtractAudio",
    "preferredcodec": "mp3",      # mp3, m4a, opus, vorbis
    "preferredquality": "320",    # Bitrate for mp3: 64-320
}]
```

### Video Conversion

```python
"postprocessors": [{
    "key": "FFmpegVideoConvertor",
    "preferedformat": "mp4",      # mp4, webm, mkv, avi
}]
```

### Embed Subtitles

```python
"postprocessors": [{
    "key": "FFmpegEmbedSubtitle",
    "subtitlesformat": "srt",     # srt, ass, vtt
}]
```

### Metadata Injection

```python
"postprocessors": [{
    "key": "FFmpegMetadata",
    "add_metadata": True,
}]
```

### Thumbnail Embedding

```python
"writethumbnail": True,
"postprocessors": [
    {"key": "FFmpegThumbnailsConvertor", "format": "jpg"},
    {"key": "FFmpegMetadata"},
    {"key": "EmbedThumbnail"},
]
```

## Common Patterns

### Download and Convert to MP3

```bash
python scripts/download_video.py "URL" --audio-only --format "bestaudio[m4a]/best"
```

### Download with Embedded Subtitles

```bash
python scripts/download_video.py "URL" --embed-subs
```

### Download Playlist with Range

```bash
python scripts/download_video.py "PLAYLIST_URL" --playlist --playlist-start 1 --playlist-end 10
```

### Download Specific Quality by File Size

```bash
python scripts/download_video.py "URL" --format "bestvideo[filesize<500M]+bestaudio/best[filesize<500M]"
```

### Age-Gated or Region-Restricted Videos

For videos requiring authentication, use cookies:

```bash
yt-dlp --cookies cookies.txt "URL"
```

Import cookies from browser:
```bash
yt-dlp --cookies-from-browser chrome "URL"
```

## Output Templates

### Basic Templates

```
%(title)s.%(ext)s           # Video title
%(id)s.%(ext)s              # Video ID
%(uploader)s/%(title)s.%(ext)s  # By channel
```

### Playlist Templates

```
%(playlist_title)s/%(playlist_index)s - %(title)s.%(ext)s
%(playlist_title)s/%(autonumber)s - %(title)s.%(ext)s
```

### Date-Based Organization

```
%(upload_date>%Y-%m-%d)s/%(title)s.%(ext)s
```

## Authentication

For private or restricted content:

```bash
# Username/password
yt-dlp -u USERNAME -p PASSWORD "URL"

# API key (for some services)
yt-dlp --api-key API_KEY "URL"

# Video password (e.g., Vimeo)
yt-dlp --video-password PASSWORD "URL"
```
