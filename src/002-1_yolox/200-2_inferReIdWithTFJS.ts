import { FeatureNum } from "./200_useInference";
import * as tf from '@tensorflow/tfjs';
import { useEffect, useRef, useState } from "react";

export const ReIdCacheMaxNums = {
    "32": 32,
    "64": 64,
    "128": 128,
    "256": 256,
} as const
export type ReIdCacheMaxNums = typeof ReIdCacheMaxNums[keyof typeof ReIdCacheMaxNums]




type InferReIdWithTFJSOption = {
    _updatePerfCounterReId?: (counter: number) => void
    _updatePerfperfCounterCosSimId?: (counter: number) => void
}
type HumanFeature = {
    id: number,
    lastUpdate: number,
    feature: tf.Tensor
}
export const useInferReIdWithTFJS = () => {
    const reIdThresholdRef = useRef<number>(0.3)
    const [reIdThreshold, _setReIdThreshold] = useState<number>(reIdThresholdRef.current)
    const setReIdThreshold = (val: number) => {
        reIdThresholdRef.current = val
        _setReIdThreshold(reIdThresholdRef.current)
    }

    const reIdCacheMaxNumRef = useRef<ReIdCacheMaxNums>(32)
    const [reIdCacheMaxNum, _setReIdCacheMaxNum] = useState<ReIdCacheMaxNums>(reIdCacheMaxNumRef.current)
    const setReIdCacheMaxNum = (val: ReIdCacheMaxNums) => {
        reIdCacheMaxNumRef.current = val
        _setReIdCacheMaxNum(reIdCacheMaxNumRef.current)
    }


    const humanFeaturesCountRef = useRef<number>(0)
    const humanFeaturesRef = useRef<HumanFeature[]>([])
    useEffect(() => {
        const humanFeatures: HumanFeature[] = Array(Number(reIdCacheMaxNum)).fill(0).map((_x, index) => {
            return {
                id: index,
                lastUpdate: new Date().getTime(),
                feature: tf.tensor(Array(FeatureNum).fill(Math.random()))
            }
        })
        humanFeaturesRef.current = humanFeatures
    }, [reIdCacheMaxNum])

    const _inferReIdWithTFJS = (session: tf.GraphModel, csSession: tf.GraphModel, humanCanvass: HTMLCanvasElement[], validCanvasNum: number, reIdChunkSize: number, opt: InferReIdWithTFJSOption) => {

        let reids: number[] = []
        if (humanCanvass.length === 0) {
            return reids
        }
        let perfCounterCosSimId_start = performance.now()
        try {
            const humanFeatures = humanFeaturesRef.current
            tf.tidy(() => {
                // (1) Teosnr from camvas
                const ts = humanCanvass.map(x => {
                    return tf.browser.fromPixels(x).cast("float32").div(255).sub([0.485, 0.456, 0.406]).div([0.229, 0.224, 0.225]);

                })

                // (2) Stack canvas as input
                const chunk_size = reIdChunkSize
                const chunks = ts.reduce((prev, cur, i) => {
                    if (i % chunk_size == 0) {
                        return [...prev, [cur]]
                    } else {
                        return [...prev.slice(0, -1), [...prev[prev.length - 1], cur]]
                    }
                }, [] as tf.Tensor[][])

                // (3) Prediction
                const perfCounterReId_start = performance.now()
                const predictions: tf.Tensor[] = []
                chunks.forEach((x) => {
                    const input = tf.stack(x, 0)
                    let prediction = (session.predict(input) as tf.Tensor).squeeze();
                    if (prediction.shape.length != 2) {
                        prediction = prediction.expandDims(0)
                    }
                    predictions.push(prediction)
                })

                const perfCounterReId_end = performance.now()
                const perfCounterReId = perfCounterReId_end - perfCounterReId_start
                if (opt._updatePerfCounterReId) {
                    opt._updatePerfCounterReId(perfCounterReId)
                }

                // (4) Concat
                let prediction = tf.concat(predictions, 0)
                if (prediction.shape.length != 2) {
                    prediction = prediction.expandDims(0)
                }
                // (5) Stored Feature
                const storedHumanFeature = humanFeatures.map(x => {
                    return x.feature
                })
                const storedFeatureTensor = tf.stack(storedHumanFeature, 0)

                // (6) Cosine Similarity
                const simPrediction = csSession.predict([prediction, storedFeatureTensor]) as tf.Tensor
                const maxIndexPre = simPrediction.argMax(0)
                const maxValuePre = simPrediction.max(0)

                perfCounterCosSimId_start = performance.now()
                // const newFeatures = prediction.slice(0, humanCanvass.length).arraySync() as number[][]
                const maxIndex = maxIndexPre.slice(0, validCanvasNum).arraySync() as number[]
                const maxValue = maxValuePre.slice(0, validCanvasNum).arraySync() as number[]

                const perfCounterCosSimId_end = performance.now()
                const perfCounterCosSimId = perfCounterCosSimId_end - perfCounterCosSimId_start
                if (opt._updatePerfperfCounterCosSimId) {
                    opt._updatePerfperfCounterCosSimId(perfCounterCosSimId)
                }

                // (7) Update data
                const predictionArray = prediction.unstack()
                reids = maxValue.map((x, index) => {
                    if (x > reIdThresholdRef.current) {
                        const storedFeatureId = maxIndex[index]
                        const storedFeature = humanFeatures[storedFeatureId]
                        // storedFeature.feature = newFeatures[index] // Feature Update
                        storedFeature.feature.dispose()
                        const newFeature = predictionArray[index]
                        storedFeature.feature = tf.variable(newFeature) // Feature Update
                        storedFeature.lastUpdate = new Date().getTime() // Time Update
                        // console.log("SAMEID:", storedFeature.id, x)
                        return storedFeature.id
                    } else {
                        const oldest = humanFeatures.sort((a, b) => {
                            if (a.lastUpdate > b.lastUpdate) {
                                return 1
                            } else {
                                return -1
                            }
                        })[0]
                        oldest.feature.dispose()
                        const newFeature = predictionArray[index]
                        oldest.feature = tf.variable(newFeature)
                        oldest.lastUpdate = new Date().getTime()
                        oldest.id = humanFeaturesCountRef.current
                        humanFeaturesCountRef.current++;
                        return oldest.id
                    }
                })

                // }
            })
        } catch (e) {
            console.error(e)
        }
        return reids;
    }
    return {
        _inferReIdWithTFJS, reIdThreshold, setReIdThreshold,
        reIdCacheMaxNum, setReIdCacheMaxNum,

    }
}


