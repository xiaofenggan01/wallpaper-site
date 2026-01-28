#!/usr/bin/env python3
"""
Video Downloader using yt-dlp
Supports downloading videos, audio, subtitles, and playlists from various platforms
"""

import argparse
import json
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(
        description="Download videos using yt-dlp",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Download best quality video
  python download_video.py "https://youtube.com/watch?v=xxx"

  # Download audio only
  python download_video.py "https://youtube.com/watch?v=xxx" --audio-only

  # Download with subtitles
  python download_video.py "https://youtube.com/watch?v=xxx" --subs

  # Download playlist
  python download_video.py "https://youtube.com/playlist?list=xxx" --playlist

  # Download specific quality
  python download_video.py "https://youtube.com/watch?v=xxx" --format "bestvideo[height<=1080]+bestaudio"
        """
    )

    parser.add_argument("url", help="Video or playlist URL")
    parser.add_argument("-o", "--output", default="~/Downloads/videos",
                        help="Output directory (default: ~/Downloads/videos)")
    parser.add_argument("-a", "--audio-only", action="store_true",
                        help="Download audio only (best quality mp3/m4a)")
    parser.add_argument("-s", "--subs", action="store_true",
                        help="Download subtitles if available")
    parser.add_argument("--embed-subs", action="store_true",
                        help="Embed subtitles into video file")
    parser.add_argument("-p", "--playlist", action="store_true",
                        help="Download entire playlist")
    parser.add_argument("--playlist-start", type=int, default=1,
                        help="Playlist item to start at (default: 1)")
    parser.add_argument("--playlist-end", type=int,
                        help="Playlist item to end at")
    parser.add_argument("-f", "--format", default="bestvideo+bestaudio/best",
                        help="Video format selector (default: bestvideo+bestaudio/best)")
    parser.add_argument("--quality", choices=["144", "240", "360", "480", "720", "1080", "1440", "2160"],
                        help="Target quality (height in pixels)")
    parser.add_argument("--no-warnings", action="store_true",
                        help="Suppress warning messages")
    parser.add_argument("--json", action="store_true",
                        help="Output download info as JSON")

    args = parser.parse_args()

    try:
        import yt_dlp
    except ImportError:
        print("Error: yt-dlp is not installed. Install with: pip install yt-dlp", file=sys.stderr)
        sys.exit(1)

    # Expand output directory
    output_dir = Path(args.output).expanduser()
    output_dir.mkdir(parents=True, exist_ok=True)

    # Build format string if quality specified
    format_string = args.format
    if args.quality:
        format_string = f"bestvideo[height<={args.quality}]+bestaudio/best[height<={args.quality}]"

    # Build output template
    if args.playlist:
        output_template = str(output_dir / "%(playlist_title)s/%(playlist_index)s - %(title)s.%(ext)s")
    else:
        output_template = str(output_dir / "%(title)s.%(ext)s")

    # Configure yt-dlp options
    ydl_opts = {
        "outtmpl": output_template,
        "quiet": not args.no_warnings,
        "no_warnings": args.no_warnings,
        "ignoreerrors": True,  # Continue on download errors
    }

    # Audio only mode
    if args.audio_only:
        ydl_opts.update({
            "format": "bestaudio/best",
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "m4a",
                "preferredquality": "320",
            }],
            "merge_output_format": "m4a",
        })
    else:
        ydl_opts["format"] = format_string
        ydl_opts["merge_output_format"] = "mp4"

    # Subtitle options
    if args.subs or args.embed_subs:
        ydl_opts["writesubtitles"] = True
        ydl_opts["writeautomaticsub"] = True
        ydl_opts["subtitleslangs"] = ["en", "zh-CN", "zh-TW", "ja", "ko"]
        ydl_opts["subtitle"] = "--sub-lang en,zh-CN,zh-TW,ja,ko"

    if args.embed_subs:
        ydl_opts["embedsubs"] = True
        ydl_opts["postprocessor_args"] = {
            "ffmpeg": ["-c:s", "mov_text"]
        }

    # Playlist options
    if not args.playlist:
        ydl_opts["noplaylist"] = True

    if args.playlist_start > 1:
        ydl_opts["playliststart"] = args.playlist_start
    if args.playlist_end:
        ydl_opts["playlistend"] = args.playlist_end

    # Download and extract info
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        # First get info without downloading
        try:
            info = ydl.extract_info(args.url, download=False)

            if args.json:
                # Output JSON info
                output_info = {
                    "title": info.get("title"),
                    "duration": info.get("duration"),
                    "uploader": info.get("uploader"),
                    "view_count": info.get("view_count"),
                    "upload_date": info.get("upload_date"),
                    "thumbnail": info.get("thumbnail"),
                    "webpage_url": info.get("webpage_url"),
                }
                if info.get("entries"):
                    output_info["playlist_count"] = len(info["entries"])
                    output_info["playlist_title"] = info.get("title")
                print(json.dumps(output_info, ensure_ascii=False, indent=2))
                return
        except Exception as e:
            print(f"Error fetching video info: {e}", file=sys.stderr)
            sys.exit(1)

        # Proceed with download
        print(f"Downloading: {info.get('title', 'Unknown')}")
        if info.get("entries"):
            print(f"Playlist: {info.get('title', 'Unknown')} ({len(info['entries'])} videos)")

        ydl.download([args.url])


if __name__ == "__main__":
    main()
