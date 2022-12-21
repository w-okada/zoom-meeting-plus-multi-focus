import { InferenceSession, Tensor } from "onnxruntime-web";
import { BoundingBox } from "./200_useInference";

type InferWithONNXOption = {
    _updatePerfCounterInference: (counter: number) => void | undefined
}
export const useInferWithONNX = () => {
    const _inferWithONNX = async (session: InferenceSession, canvas: HTMLCanvasElement, inputShapeArray: number[], ratio: number, opt: InferWithONNXOption) => {
        const validBox: BoundingBox[] = []
        // generate input tensor
        //// get source image data (input tensor size)
        const ctx = canvas.getContext("2d")!
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const [redArray, greenArray, blueArray] = new Array(new Array<number>(), new Array<number>(), new Array<number>());
        //// get RGB Data
        for (let i = 0; i < imageData.data.length; i += 4) {
            redArray.push(imageData.data[i]);
            greenArray.push(imageData.data[i + 1]);
            blueArray.push(imageData.data[i + 2]);
            // skip data[i + 3] to filter out the alpha channel
        }
        //// Transpose
        const transposedData = blueArray.concat(greenArray).concat(redArray);
        const float32Data = new Float32Array(3 * inputShapeArray[0] * inputShapeArray[1]);
        for (let i = 0; i < transposedData.length; i++) {
            float32Data[i] = transposedData[i] / 1.0
        }
        //// Generate
        const inputTensor = new Tensor("float32", float32Data, [1, 3, inputShapeArray[0], inputShapeArray[1]]);

        // Process YOLOX
        const feeds = { images: inputTensor };
        const perfCounterInference_start = performance.now()
        const results = await session.run(feeds)
        const perfCounterInference_end = performance.now()
        const perfCounterInference = perfCounterInference_end - perfCounterInference_start
        if (opt._updatePerfCounterInference) {
            opt._updatePerfCounterInference(perfCounterInference)
        }


        const output = results.output
        // console.log(output, output.dims)

        // Calculate BoundningBox
        //// tune center point and w/h
        const strides = [8, 16, 32]
        const hsizes = [inputShapeArray[0] / 8, inputShapeArray[0] / 16, inputShapeArray[0] / 32]
        const wsizes = [inputShapeArray[1] / 8, inputShapeArray[1] / 16, inputShapeArray[1] / 32]
        // console.log(hsizes, wsizes)
        let index = 0;
        for (let i = 0; i < strides.length; i++) {
            for (let yi = 0; yi < hsizes[i]; yi++) {
                for (let wi = 0; wi < wsizes[i]; wi++) {
                    const offset = output.dims[2] * index
                    output.data[offset + 0] = (output.data[offset + 0] as number + wi) * strides[i]
                    output.data[offset + 1] = (output.data[offset + 1] as number + yi) * strides[i]
                    output.data[offset + 2] = Math.exp(output.data[offset + 2] as number) * strides[i]
                    output.data[offset + 3] = Math.exp(output.data[offset + 3] as number) * strides[i]
                    index++;
                }
            }
        }

        for (let i = 0; i < output.data.length; i += output.dims[2]) {
            const cxr = output.data[i + 0] as number
            const cyr = output.data[i + 1] as number
            const wr = output.data[i + 2] as number
            const hr = output.data[i + 3] as number
            const startX = (cxr - (wr / 2)) / ratio
            const startY = (cyr - (hr / 2)) / ratio
            const endX = (cxr + (wr / 2)) / ratio
            const endY = (cyr + (hr / 2)) / ratio
            const scores = new Array<number>()
            // note: score = (boundingbox score) x (class score)
            for (let j = 5; j < output.dims[2]; j++) {
                const score = (output.data[i + j] as number) * (output.data[i + 4] as number)
                scores.push(score)
            }
            const classIdx = scores.indexOf(Math.max(...scores))
            const score = scores[classIdx]
            const area = (endX - startX + 1) * (endY - startY + 1)
            validBox.push({
                startX, startY, endX, endY, classIdx, score, area, valid: true, motId: -1
            })
        }
        return validBox
    }
    return { _inferWithONNX }
}
