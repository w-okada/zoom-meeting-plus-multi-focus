import { BoundingBox } from "./200_useInference";
import * as tf from '@tensorflow/tfjs';

type InferWithTFJSOption = {
    _updatePerfCounterInference?: (counter: number) => void
}

export const useInferWithTFJS = () => {
    const _inferWithTFJS = async (session: tf.GraphModel, canvas: HTMLCanvasElement, inputShapeArray: number[], ratio: number, opt: InferWithTFJSOption) => {
        const validBox: BoundingBox[] = []
        tf.tidy(() => {
            const t = tf.browser.fromPixels(canvas).expandDims(0).cast("float32");
            // Process YOLOX
            const perfCounterInference_start = performance.now()
            let prediction = (session.predict(t) as tf.Tensor).squeeze();
            const perfCounterInference_end = performance.now()
            const perfCounterInference = perfCounterInference_end - perfCounterInference_start
            if (opt._updatePerfCounterInference) {
                opt._updatePerfCounterInference(perfCounterInference)
            }

            // console.log("PREDICTION:::", prediction)


            // Calculate BoundningBox
            //// tune center point and w/h
            const strides = [8, 16, 32]
            const hsizes = [inputShapeArray[0] / 8, inputShapeArray[0] / 16, inputShapeArray[0] / 32]
            const wsizes = [inputShapeArray[1] / 8, inputShapeArray[1] / 16, inputShapeArray[1] / 32]
            const gridsArray: tf.Tensor[] = []
            const expandedStridesArray: tf.Tensor[] = []
            for (let i = 0; i < strides.length; i++) {
                const [xv, yv] = tf.meshgrid(tf.range(0, wsizes[i], 1, "int32"), tf.range(0, hsizes[i], 1, "int32"))
                const grid = tf.stack([xv, yv], 2).reshape([-1, 2])
                gridsArray.push(grid)
                const shape = grid.shape as [number, number]
                const filledStrides = tf.fill([shape[0]], strides[i])
                expandedStridesArray.push(filledStrides)
            }
            const grids = tf.concat(gridsArray, 0)
            const expanded_strides = tf.concat(expandedStridesArray, 0).reshape([-1, 1])
            ////// **** tfjsでカラムごとの操作をする方法がわからないので要素毎にsplitしてしまう。(Todo:要改善) ****
            let [x, y, w, h, boxScores, scores] = tf.split(prediction, [1, 1, 1, 1, 1, -1], 1)
            let [ancx, ancy] = tf.split(grids, [1, 1], 1)
            x = x.add(ancx).mul(expanded_strides)
            y = y.add(ancy).mul(expanded_strides)
            w = tf.exp(w).mul(expanded_strides)
            h = tf.exp(h).mul(expanded_strides)

            //// Generate Bounding Box
            const startX = x.sub(w.div(2)).div(ratio)
            const endX = x.add(w.div(2)).div(ratio)
            const startY = y.sub(h.div(2)).div(ratio)
            const endY = y.add(h.div(2)).div(ratio)
            // note: score = (boundingbox score) x (class score)
            const realScores = scores.mul(boxScores)
            const maxScoreIndexs = tf.argMax(realScores, 1).reshape([-1, 1])
            const maxScores = tf.max(realScores, 1).reshape([-1, 1])
            const area = endX.sub(startX).add(1).mul(endY.sub(startY).add(1))
            const rect = tf.concat([startX, startY, endX, endY, maxScoreIndexs, maxScores, area], 1)


            // Download Bounding Box
            const data = rect.arraySync() as [number, number, number, number, number, number, number][]
            const predictRects: BoundingBox[] = data.map(x => {
                return {
                    startX: x[0],
                    startY: x[1],
                    endX: x[2],
                    endY: x[3],
                    classIdx: x[4],
                    score: x[5],
                    area: x[6],
                    valid: true,
                    motId: -1,

                }
            })
            // console.log("DATA:::", predictRects)
            validBox.push(
                ...predictRects
            )
        })
        return validBox
    }
    return { _inferWithTFJS }
}
