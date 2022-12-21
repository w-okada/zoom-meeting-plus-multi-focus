import { COLOR_RAINBOW } from "../const";
import { BoundingBox } from "./200_useInference";

export const useDrawTrackedPersonBoxes = () => {

    const _drawTrackedPersondBoxes = (dstCanvasCtx: CanvasRenderingContext2D, humanBox: BoundingBox[]) => {

        humanBox.forEach((x) => {
            const color = COLOR_RAINBOW[x.motId % COLOR_RAINBOW.length]
            // console.log(color, x.motId, COLOR_RAINBOW.length)
            const colorStr = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`

            dstCanvasCtx.beginPath();
            dstCanvasCtx.strokeStyle = colorStr;
            dstCanvasCtx.lineWidth = 3;
            dstCanvasCtx.rect(x.startX, x.startY, x.endX - x.startX, x.endY - x.startY);
            dstCanvasCtx.stroke();
            dstCanvasCtx.fillStyle = colorStr;
            dstCanvasCtx.font = "bold 60px 'Segoe Print', san-serif";
            dstCanvasCtx.fillText(`ID:${x.motId}`, x.startX, x.startY)

        })

    }
    return { _drawTrackedPersondBoxes }
}


