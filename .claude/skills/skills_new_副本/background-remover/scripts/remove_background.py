#!/usr/bin/env python3
"""
Batch Background Removal using CarveKit
Remove backgrounds from images with high quality using neural networks
"""

import argparse
import sys
from pathlib import Path
from typing import List, Optional


def main():
    parser = argparse.ArgumentParser(
        description="Remove backgrounds from images using CarveKit",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Remove background from single image
  python remove_background.py input.jpg -o output.png

  # Process entire folder
  python remove_background.py ./images/ -o ./output/

  # Process with hair-friendly mode (U2Net)
  python remove_background.py input.jpg --mode hairs

  # Batch process with specific quality
  python remove_background.py ./photos/ -o ./no_bg/ --quality high
        """
    )

    parser.add_argument("input", help="Input image file or directory")
    parser.add_argument("-o", "--output", default="./output",
                        help="Output file or directory (default: ./output)")
    parser.add_argument("--mode", choices=["auto", "hairs", "general"],
                        default="auto",
                        help="Processing mode: auto (detect), hairs (U2Net), general (Tracer-B7)")
    parser.add_argument("--device", choices=["auto", "cpu", "cuda"],
                        default="auto",
                        help="Processing device (default: auto)")
    parser.add_argument("--quality", choices=["fast", "balanced", "high"],
                        default="balanced",
                        help="Quality/Speed trade-off")
    parser.add_argument("--post-processing", choices=["fba", "none"],
                        default="fba",
                        help="Post-processing method (fba recommended for hair)")
    parser.add_argument("--batch-size", type=int, default=5,
                        help="Batch size for processing (default: 5)")
    parser.add_argument("--fp16", action="store_true",
                        help="Enable FP16 for faster processing (GPU only)")

    args = parser.parse_args()

    # Check dependencies
    try:
        import torch
        from carvekit.api.high import HiInterface
        from PIL import Image
    except ImportError as e:
        print(f"Error: Required package not found: {e}", file=sys.stderr)
        print("\nPlease install CarveKit:", file=sys.stderr)
        print("  CPU:  pip install carvekit --extra-index-url https://download.pytorch.org/whl/cpu", file=sys.stderr)
        print("  GPU:  pip install carvekit --extra-index-url https://download.pytorch.org/whl/cu121", file=sys.stderr)
        sys.exit(1)

    # Determine device
    if args.device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    else:
        device = args.device

    # Determine object type and mask size based on mode
    if args.mode == "hairs":
        object_type = "hairs-like"
        seg_mask_size = 320  # U2Net optimal
    elif args.mode == "general":
        object_type = "object"
        seg_mask_size = 640  # Tracer-B7 optimal
    else:  # auto
        object_type = "hairs-like"
        seg_mask_size = 640  # Tracer-B7 default

    # Adjust parameters based on quality
    if args.quality == "fast":
        batch_size_seg = 10
        seg_mask_size = 320
        matting_mask_size = 1024
    elif args.quality == "high":
        batch_size_seg = 2
        matting_mask_size = 2048
    else:  # balanced
        batch_size_seg = args.batch_size
        matting_mask_size = 2048

    # Setup output path
    input_path = Path(args.input).expanduser()
    output_path = Path(args.output).expanduser()

    if not input_path.exists():
        print(f"Error: Input path does not exist: {input_path}", file=sys.stderr)
        sys.exit(1)

    # Collect input images
    image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}
    input_images: List[Path] = []

    if input_path.is_file():
        if input_path.suffix.lower() in image_extensions:
            input_images.append(input_path)
        else:
            print(f"Error: Not a supported image file: {input_path}", file=sys.stderr)
            sys.exit(1)
    else:  # directory
        input_images = [f for f in input_path.rglob("*")
                       if f.suffix.lower() in image_extensions]

    if not input_images:
        print(f"Error: No images found in {input_path}", file=sys.stderr)
        sys.exit(1)

    # Create output directory if needed
    if len(input_images) > 1 or input_path.is_dir():
        output_path.mkdir(parents=True, exist_ok=True)

    print(f"Processing {len(input_images)} image(s) on {device.upper()}...")
    print(f"Mode: {args.mode}, Quality: {args.quality}")
    if len(input_images) == 1:
        print(f"Input: {input_images[0]}")
        print(f"Output: {output_path if input_path.is_file() else output_path / input_images[0].name}")
    else:
        print(f"Input directory: {input_path}")
        print(f"Output directory: {output_path}")

    # Initialize CarveKit interface
    interface = HiInterface(
        object_type=object_type,
        batch_size_seg=batch_size_seg,
        batch_size_matting=1,
        device=device,
        seg_mask_size=seg_mask_size,
        matting_mask_size=matting_mask_size,
        trimap_prob_threshold=231,
        trimap_dilation=30,
        trimap_erosion_iters=5,
        fp16=args.fp16
    )

    # Process images
    results = interface([str(img) for img in input_images])

    # Save results
    for i, (input_img, result_img) in enumerate(zip(input_images, results)):
        if len(input_images) == 1 and input_path.is_file():
            # Single file - save to specified output path
            output_file = output_path
        else:
            # Multiple files - preserve directory structure or just filename
            output_file = output_path / f"{input_img.stem}_no_bg{input_img.suffix}"

        result_img.save(output_file)
        print(f"[{i+1}/{len(input_images)}] Saved: {output_file}")

    print(f"\nComplete! Processed {len(input_images)} image(s).")


if __name__ == "__main__":
    main()
