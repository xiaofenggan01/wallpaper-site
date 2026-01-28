# Advanced CarveKit Configuration

## Low-Level API Usage

For complete control over the background removal pipeline, use the low-level API instead of HiInterface.

### Basic Low-Level Interface

```python
import PIL.Image
from carvekit.api.interface import Interface
from carvekit.ml.wrap.tracer_b7 import TracerUniversalB7
from carvekit.ml.wrap.fba_matting import FBAMatting
from carvekit.pipelines.postprocessing import MattingMethod
from carvekit.pipelines.preprocessing import PreprocessingStub
from carvekit.trimap.generator import TrimapGenerator

# Initialize segmentation network
seg_net = TracerUniversalB7(device='cpu', batch_size=1)

# Initialize matting network
fba = FBAMatting(device='cpu', input_tensor_size=2048, batch_size=1)

# Initialize trimap generator
trimap = TrimapGenerator()

# Create interface
interface = Interface(
    pre_pipe=PreprocessingStub(),
    post_pipe=MattingMethod(matting_module=fba, trimap_generator=trimap, device='cpu'),
    seg_pipe=seg_net
)

# Process image
image = PIL.Image.open('input.jpg')
result = interface([image])[0]
result.save('output.png')
```

## Available Neural Networks

### Segmentation Networks

#### TracerUniversalB7 (Default)
```python
from carvekit.ml.wrap.tracer_b7 import TracerUniversalB7

seg_net = TracerUniversalB7(
    device='cpu',
    batch_size=1,
    input_tensor_size=640,
    num_workers=1
)
```
- Best for: General purpose
- Mask size: 640
- Trimap: (30, 5)

#### U2Net
```python
from carvekit.ml.wrap.u2net import U2Net

seg_net = U2Net(
    device='cpu',
    batch_size=1,
    input_tensor_size=320,
    num_workers=1
)
```
- Best for: Hair, portraits, animals
- Mask size: 320
- Trimap: (30, 5)

#### BASNet
```python
from carvekit.ml.wrap.basnet import BASNet

seg_net = BASNet(
    device='cpu',
    batch_size=1,
    input_tensor_size=320,
    num_workers=1
)
```
- Best for: People, objects
- Mask size: 320
- Trimap: (30, 5)

#### DeepLabV3
```python
from carvekit.ml.wrap.deeplab_v3 import ResNet101DeepLabV3

seg_net = ResNet101DeepLabV3(
    device='cpu',
    batch_size=1,
    input_tensor_size=1024,
    num_workers=1,
    weights_path='./weights/deeplabv3_resnet101_coco.pth'
)
```
- Best for: People, animals, cars
- Mask size: 1024
- Trimap: (40, 20)

### Matting Networks

#### FBA Matting (Recommended)
```python
from carvekit.ml.wrap.fba_matting import FBAMatting

fba = FBAMatting(
    device='cpu',
    input_tensor_size=2048,
    batch_size=1
)
```
Best for: Hair and fine detail edges

## Preprocessing Pipelines

### None (Default)
```python
from carvekit.pipelines.preprocessing import PreprocessingStub
preprocessing = PreprocessingStub()
```

## Post-Processing Pipelines

### Matting with Trimap
```python
from carvekit.pipelines.postprocessing import MattingMethod
from carvekit.trimap.generator import TrimapGenerator

postprocessing = MattingMethod(
    matting_module=fba,
    trimap_generator=TrimapGenerator(
        prob_threshold=231,
        kernel_size=30,
        erosion_iters=5
    ),
    device='cpu'
)
```

### None
```python
from carvekit.pipelines.postprocessing import PostprocessingStub
postprocessing = PostprocessingStub()
```

## Trimap Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| `prob_threshold` | 0-255 | Probability threshold for mask classification |
| `kernel_size` | 1-50 | Dilation radius for unknown area |
| `erosion_iters` | 1-20 | Number of erosion iterations |

## Performance Optimization

### GPU Processing with FP16
```python
interface = HiInterface(
    device='cuda',
    fp16=True,  # 2x faster, lower memory
    batch_size_seg=10,
    batch_size_matting=2
)
```

### CPU Optimization
```python
interface = HiInterface(
    device='cpu',
    batch_size_seg=5,
    batch_size_matting=1,
    seg_mask_size=320,  # Lower resolution
    matting_mask_size=1024
)
```

### Batch Processing
```python
# Process multiple images at once
images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
results = interface(images)
```

## Custom Quality Presets

### Ultra Fast
```python
interface = HiInterface(
    object_type='object',
    batch_size_seg=15,
    batch_size_matting=1,
    seg_mask_size=320,
    matting_mask_size=512,
    device='cpu'
)
```

### Ultra Quality
```python
interface = HiInterface(
    object_type='hairs-like',
    batch_size_seg=1,
    batch_size_matting=1,
    seg_mask_size=640,
    matting_mask_size=2048,
    trimap_dilation=30,
    trimap_erosion_iters=5,
    device='cuda' if torch.cuda.is_available() else 'cpu'
)
```

## CLI Direct Usage

CarveKit also has a built-in CLI:

```bash
python -m carvekit -i input.jpg -o output.png --device cpu
```

### CLI Options
```
-i, --input           Input file or directory [required]
-o, --output          Output file or directory
--net                 Segmentation network: tracer_b7, u2net, basnet, deeplabv3
--pre                 Preprocessing: none
--post                Postprocessing: fba, none
--device              Processing device: cpu, cuda
--batch_size          Batch size for loading images
--batch_size_seg      Batch size for segmentation
--batch_size_mat      Batch size for matting
--seg_mask_size       Segmentation mask size
--matting_mask_size   Matting mask size
--trimap_dilation     Trimap dilation radius
--trimap_erosion      Trimap erosion iterations
--trimap_prob_threshold  Trimap probability threshold
--fp16                Enable FP16 (GPU only)
--recursive           Enable recursive directory search
```

## Troubleshooting

### Out of Memory
- Reduce `batch_size_seg` and `batch_size_matting`
- Reduce `seg_mask_size` and `matting_mask_size`
- Enable FP16 if using GPU: `fp16=True`

### Slow Processing
- Use GPU instead of CPU
- Enable FP16: `fp16=True`
- Increase batch sizes
- Reduce mask sizes for faster but lower quality

### Poor Hair Detection
- Use U2Net: `object_type='hairs-like'`
- Enable FBA matting
- Increase `matting_mask_size`
- Adjust trimap parameters
