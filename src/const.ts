export const INPUT_VIDEO_ELEMENT = "input-video-element"
export const SNAP_CANVAS_ELEMENT = "snap-canvas-element"
export const RECT_CANVAS_ELEMENT = "rect-canvas-element"
export const OUT_CANVAS_ELEMENT = "out-canvas-element"

// export const OUT_WIDTH = 1024
// export const OUT_HEIGHT = 960
export const OUT_WIDTH = 640
export const OUT_HEIGHT = 360



////////////////////////////////
export const TARGET_CANVAS_ID = "target-canvas"
export const TEMPORARY_CANVAS_ID = "temporary-canvas"
export const TEMPORARY_HUMAN_CANVAS_CONTAINER_ID = "temporary-human-canvas-container"
export const PERFORMANCE_ALL_SPAN = "performance-all-span"
export const PERFORMANCE_INFER_SPAN = "performance-infer-span"
export const PERFORMANCE_REID_SPAN = "performance-reid-span"
export const PERFORMANCE_COSSIM_SPAN = "performance-comsim-span"
export const PERFORMANCE_PERSON_NUM_SPAN = "performance-person-num-span"
export const PERFORMANCE_FPS_SPAN = "performance-fps-span"

export const STATUS_WARMUP_SPAN = "status-warmup-span"

export const MediaType = {
    image: "image",
    movie: "movie",
    camera: "camera",
    screen: "screen"
} as const
export type MediaType = typeof MediaType[keyof typeof MediaType]


export const names = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
    'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
    'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
    'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
    'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
    'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
    'hair drier', 'toothbrush']

//// Utility for Demo
export const COLOR_RAINBOW = [
    [110, 64, 170],
    [143, 61, 178],
    [178, 60, 178],
    [210, 62, 167],
    [238, 67, 149],
    [255, 78, 125],
    [255, 94, 99],
    [255, 115, 75],
    [255, 140, 56],
    [239, 167, 47],
    [217, 194, 49],
    [194, 219, 64],
    [175, 240, 91],
    [135, 245, 87],
    [96, 247, 96],
    [64, 243, 115],
    [40, 234, 141],
    [28, 219, 169],
    [26, 199, 194],
    [33, 176, 213],
    [47, 150, 224],
    [65, 125, 224],
    [84, 101, 214],
    [99, 81, 195],
];
