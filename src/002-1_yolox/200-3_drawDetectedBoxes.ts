import { COLOR_RAINBOW, names } from "../const";
import { BoundingBox, SelectedRects } from "./200_useInference";

export const useDrawDetectedBoxes = () => {

    const _drawDetectedBoxes = (dstCanvasCtx: CanvasRenderingContext2D, boxes: SelectedRects) => {
        boxes.rects.forEach((x) => {
            const color = COLOR_RAINBOW[0]
            const colorStr = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6)`

            dstCanvasCtx.beginPath();
            dstCanvasCtx.strokeStyle = colorStr;
            dstCanvasCtx.lineWidth = 3;
            dstCanvasCtx.rect(x.startX, x.startY, x.endX - x.startX, x.endY - x.startY);
            dstCanvasCtx.stroke();
            dstCanvasCtx.fillStyle = colorStr;
            dstCanvasCtx.font = "bold 60px 'Segoe Print', san-serif";
            dstCanvasCtx.fillText(`${(x.score * 100).toFixed(1)}%`, x.startX, x.startY)

        })
    }

    return { _drawDetectedBoxes }
}


