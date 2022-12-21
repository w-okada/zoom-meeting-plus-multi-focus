import * as tf from '@tensorflow/tfjs';
import { TEMPORARY_CANVAS_ID } from '../const';
import { useInferWithTFJS } from './200-1_inferWithTFJS';
import { useInferReIdWithTFJS } from './200-2_inferReIdWithTFJS';


type InferWithONNXOption = {
    _updateWarmupProgress: (objectDetectionProgress: number, reIdProgress: number) => void | undefined
}
export const useWarmup = () => {
    const { _inferWithTFJS } = useInferWithTFJS()
    const { _inferReIdWithTFJS } = useInferReIdWithTFJS()

    const _warmup = async (session: tf.GraphModel | null, inputShapeArray: number[], reIdsession: tf.GraphModel | null, csSession: tf.GraphModel | null, reIdChunkSize: number, opt: InferWithONNXOption) => {
        try {
            if (opt._updateWarmupProgress) {
                opt._updateWarmupProgress(0, 0)
            }
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 100)
            })

            if (session) {
                const dummyCanvass = document.getElementById(TEMPORARY_CANVAS_ID) as HTMLCanvasElement
                dummyCanvass.height = inputShapeArray[0]
                dummyCanvass.width = inputShapeArray[1]
                await _inferWithTFJS(session, dummyCanvass, inputShapeArray, 1.0, {})
            }

            if (opt._updateWarmupProgress) {
                opt._updateWarmupProgress(1, 0)
            }
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 100)
            })

            if (reIdsession && csSession) {
                // for (let i = 0; i < ReIdMaxNum; i++) {
                //     console.log("warmup count:", i)
                //     const dummyCanvass = Array(i).fill(0).map(_x => {
                //         const dummyCanvas = document.createElement("canvas")
                //         dummyCanvas.width = 128
                //         dummyCanvas.height = 256
                //         return dummyCanvas
                //     })
                //     _inferReIdWithTFJS(reIdsession, csSession, dummyCanvass, {})
                //     if (opt._updateWarmupProgress) {
                //         opt._updateWarmupProgress(1, i / ReIdMaxNum)
                //     }
                //     await new Promise<void>((resolve) => {
                //         setTimeout(resolve, 100)
                //     })
                // }

                const dummyCanvass = Array(reIdChunkSize).fill(0).map(_x => {
                    const dummyCanvas = document.createElement("canvas")
                    dummyCanvas.width = 128
                    dummyCanvas.height = 256
                    return dummyCanvas
                })
                _inferReIdWithTFJS(reIdsession, csSession, dummyCanvass, dummyCanvass.length, reIdChunkSize, {})
            }

            if (opt._updateWarmupProgress) {
                opt._updateWarmupProgress(1, 1)
            }
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 100)
            })
        } catch (e) {
            console.error("WARMUP ERROR", e)
        }
    }


    return { _warmup }
}
