---
name: background-remover
description: Remove image backgrounds using CarveKit neural networks. Use for - batch background removal from photos - extracting people/objects from images - creating transparent PNGs - processing product photos - removing backgrounds from portraits with hair. Supports single images or entire folders with high-quality edge detection and hair preservation.
---

# Background Remover

## Quick Start

Check if CarveKit is installed:
```bash
pip show carvekit
```

Install CarveKit (CPU version):
```bash
pip install carvekit --extra-index-url https://download.pytorch.org/whl/cpu
```

Install CarveKit (GPU version, requires CUDA):
```bash
pip install carvekit --extra-index-url https://download.pytorch.org/whl/cu121
```

Remove background from a single image:
```bash
python scripts/remove_background.py photo.jpg -o photo_no_bg.png
```

Process entire folder:
```bash
python scripts/remove_background.py ./photos/ -o ./output/
```

## Core Features

### 1. Basic Background Removal

Default mode uses Tracer-B7 (general purpose):
```bash
python scripts/remove_background.py input.jpg -o output.png
```

### 2. Hair-Friendly Mode

Use U2Net model for better hair/edge detection:
```bash
python scripts/remove_background.py portrait.jpg --mode hairs
```

Recommended for portraits, animals, and images with complex edges.

### 3. Batch Processing

Process all images in a folder:
```bash
python scripts/remove_background.py ./input_folder/ -o ./output_folder/
```

Supported formats: JPG, PNG, WebP, BMP, TIFF

### 4. Quality vs Speed

| Quality | Description |
|---------|-------------|
| `fast` | Quick processing, lower resolution |
| `balanced` (default) | Good quality, reasonable speed |
| `high` | Best quality, slower processing |

```bash
python scripts/remove_background.py photo.jpg --quality high
```

### 5. Device Selection

Auto-detect GPU/CUDA:
```bash
python scripts/remove_background.py photo.jpg --device auto
```

Force CPU or GPU:
```bash
python scripts/remove_background.py photo.jpg --device cpu
python scripts/remove_background.py photo.jpg --device cuda
```

### 6. Post-Processing

Use FBA matting for better edges (default):
```bash
python scripts/remove_background.py photo.jpg --post-processing fba
```

Disable post-processing for faster results:
```bash
python scripts/remove_background.py photo.jpg --post-processing none
```

## Neural Network Models

| Model | Mode | Best For | Accuracy |
|-------|------|----------|----------|
| **Tracer-B7** | `--mode general` | Objects, products, general | 90% F1-Score |
| **U2Net** | `--mode hairs` | Hair, portraits, animals | 80% F1-Score |
| **BASNet** | - | People, objects | 80% F1-Score |
| **DeepLabV3** | - | People, animals, cars | 67% IoU |

## Script Options

| Option | Description |
|--------|-------------|
| `input` | Input image file or directory (required) |
| `-o, --output` | Output path (default: ./output) |
| `--mode` | Processing mode: auto, hairs, general |
| `--device` | Device: auto, cpu, cuda |
| `--quality` | Quality: fast, balanced, high |
| `--post-processing` | Post-processing: fba, none |
| `--batch-size` | Batch size for processing (default: 5) |
| `--fp16` | Enable FP16 for faster GPU processing |

## Usage Tips

1. **For portraits with hair**: Use `--mode hairs`
2. **For product photos**: Use default mode (Tracer-B7)
3. **For large batches**: Use `--quality fast` or reduce `--batch-size`
4. **For best quality**: Use `--quality high` with `--mode hairs`
5. **GPU users**: Add `--fp16` for 2x faster processing

## Advanced Configuration

See [references/advanced.md](references/advanced.md) for low-level API usage, custom pipelines, and model parameters.
