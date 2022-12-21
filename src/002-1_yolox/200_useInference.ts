import { useRef, useState } from "react"
import { INPUT_VIDEO_ELEMENT, MediaType, OUT_CANVAS_ELEMENT, OUT_HEIGHT, OUT_WIDTH, PERFORMANCE_ALL_SPAN, PERFORMANCE_COSSIM_SPAN, PERFORMANCE_FPS_SPAN, PERFORMANCE_INFER_SPAN, PERFORMANCE_PERSON_NUM_SPAN, PERFORMANCE_REID_SPAN, RECT_CANVAS_ELEMENT, select, STATUS_WARMUP_SPAN, TARGET_CANVAS_ID, TEMPORARY_CANVAS_ID, } from "../const";
import { InferenceSession } from 'onnxruntime-web';

import * as tf from '@tensorflow/tfjs';
import { useInferWithONNX } from "./200-1_inferWithONNX";
import { useInferWithTFJS } from "./200-1_inferWithTFJS";
import { ReIdCacheMaxNums, useInferReIdWithTFJS } from "./200-2_inferReIdWithTFJS";
import { useWarmup } from "./200-0_warmup";
import { useNMS } from "./200-1_nms";
import { useCropPersonCanvas } from "./200-2_cropPersonCanvas";
import { useDrawDetectedBoxes } from "./200-3_drawDetectedBoxes";
import { useDrawTrackedPersonBoxes } from "./200-3_drawTrackedPersonBoxes";

export const EngineType = {
    onnx: "onnx",
    tfjs: "tfjs"
} as const
export type EngineType = typeof EngineType[keyof typeof EngineType]

export const InputShape = {
    "256x320": "256x320",
    "256x480": "256x480",
    "256x640": "256x6400",
    "320x320": "320x320",
    "384x640": "384x640",
    "416x416": "416x416",
    "480x640": "480x640",
    "640x640": "640x640",
    "736x1280": "736x1280",
    "1088x1920": "1088x1920",
    "1280x1280": "1280x1280",
    "1920x1920": "1920x1920",
} as const
export type InputShape = typeof InputShape[keyof typeof InputShape]

export const ReIdMaxNums = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8,
    "16": 16,
} as const
export type ReIdMaxNums = typeof ReIdMaxNums[keyof typeof ReIdMaxNums]

export const ApplicationMode = {
    "detection": "detection",
    "person_tracking": "person_tracking"
} as const
export type ApplicationMode = typeof ApplicationMode[keyof typeof ApplicationMode]

export const ReIdChunkSizes = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8,
    "16": 16,
} as const
export type ReIdChunkSizes = typeof ReIdChunkSizes[keyof typeof ReIdChunkSizes]


export type SelectedRects = {
    startTime: number
    rects: {
        motId: number
        score: number
        startX: number
        startY: number
        endX: number
        endY: number
    }[]
}

// export const NMSDropOverlapThreshold = 0.55
const PerformancCounter_num = 10
// export const ReIdChunkSize = 8
export const FeatureNum = 768

export type BoundingBox = {
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    classIdx: number,
    score: number,
    area: number,
    valid: boolean
    motId: number
}

type WarmupProgress = {
    objectDetectionProgress: number
    reIdProgress: number
}


export type InferenceState = {
    processId: number
    engineType: EngineType
    inputShape: InputShape
    applicationMode: ApplicationMode
    reIdThreshold: number
    reIdChunkSize: ReIdChunkSizes
    reIdCacheMaxNum: ReIdCacheMaxNums
    reIdMaxNum: ReIdMaxNums
    scoreThreshold: number
    nMSDropOverlapThreshold: number

    skipRate: number
    cellNum: number
    rotateTime: number
}

export type InferenceStateAndMethod = InferenceState & {
    startProcess: (type: MediaType, inputResolution: [number, number], processId: number) => Promise<void>
    stopProcess: () => Promise<void>
    setEnginType: (val: EngineType) => void
    setInputShape: (val: InputShape) => void
    setApplicationMode: (val: ApplicationMode) => void
    setReIdChunkSize: (val: ReIdChunkSizes) => void
    setReIdThreshold: (val: number) => void
    setReIdCacheMaxNum: (val: ReIdCacheMaxNums) => void
    setReIdMaxNum: (val: ReIdMaxNums) => void
    setScoreThreshold: (val: number) => void
    setNMSDropOverlapThreshold: (val: number) => void

    setSkipRate: (val: number) => void
    setCellNum: (val: number) => void
    setRotateTime: (val: number) => void

}

export const useInference = (): InferenceStateAndMethod => {
    const frameCounterRef = useRef<number>(0)
    const skipRateRef = useRef<number>(0)
    const [skipRate, _setSkipRate] = useState<number>(skipRateRef.current)
    const setSkipRate = (val: number) => {
        skipRateRef.current = val
        _setSkipRate(skipRateRef.current)
    }

    const { _warmup } = useWarmup()
    const { _inferWithONNX } = useInferWithONNX()
    const { _inferWithTFJS } = useInferWithTFJS()
    const { _nms, nMSDropOverlapThreshold, setNMSDropOverlapThreshold } = useNMS()
    const { _cropPersonCanvas } = useCropPersonCanvas()
    const { _inferReIdWithTFJS, reIdThreshold, setReIdThreshold, reIdCacheMaxNum, setReIdCacheMaxNum } = useInferReIdWithTFJS()
    const { _drawDetectedBoxes } = useDrawDetectedBoxes()
    const { _drawTrackedPersondBoxes } = useDrawTrackedPersonBoxes()

    const processIdRef = useRef<number>(0)
    const [processId, setProcessId] = useState<number>(processIdRef.current)
    const [engineType, setEnginType] = useState<EngineType>("tfjs")
    const [inputShape, setInputShape] = useState<InputShape>("416x416")
    const [applicationMode, setApplicationMode] = useState<ApplicationMode>("detection")
    const cellNumRef = useRef<number>(2)
    const [cellNum, _setCellNum] = useState<number>(cellNumRef.current)
    const setCellNum = (val: number) => {
        cellNumRef.current = val
        _setCellNum(cellNumRef.current)
    }
    const rotateTimeRef = useRef<number>(5)
    const [rotateTime, _setRotateTime] = useState<number>(rotateTimeRef.current)
    const setRotateTime = (val: number) => {
        rotateTimeRef.current = val
        _setRotateTime(rotateTimeRef.current)
    }
    const selectedRectsRef = useRef<SelectedRects>({
        startTime: 0,
        rects: []
    })

    const reIdChunkSizeRef = useRef<ReIdChunkSizes>(1)
    const [reIdChunkSize, _setReIdChunkSize] = useState<ReIdChunkSizes>(reIdChunkSizeRef.current)
    const setReIdChunkSize = (val: ReIdChunkSizes) => {
        reIdChunkSizeRef.current = val
        _setReIdChunkSize(reIdChunkSizeRef.current)
    }

    const reIdMaxNumRef = useRef<ReIdMaxNums>(16)
    const [reIdMaxNum, _setReIdMaxNum] = useState<ReIdMaxNums>(reIdMaxNumRef.current)
    const setReIdMaxNum = (val: ReIdMaxNums) => {
        reIdMaxNumRef.current = val
        _setReIdMaxNum(reIdMaxNumRef.current)
    }

    const scoreThresholdRef = useRef<number>(0.3)
    const [scoreThreshold, _setScoreThreshold] = useState<number>(scoreThresholdRef.current)
    const setScoreThreshold = (val: number) => {
        scoreThresholdRef.current = val
        _setScoreThreshold(scoreThresholdRef.current)
    }


    const perfCounterInferenceRef = useRef<number[]>([])
    const perfCounterReIdRef = useRef<number[]>([])
    const perfCounterCosSimIdRef = useRef<number[]>([])
    const perfCounterAllRef = useRef<number[]>([])
    const perfFrameCounterRef = useRef<number[]>([])
    const perfPersonNumRef = useRef<number>(0)
    const _updatePerfCounterInference = (counter: number) => {
        perfCounterInferenceRef.current.push(counter)
        while (perfCounterInferenceRef.current.length > PerformancCounter_num) {
            perfCounterInferenceRef.current.shift()
        }
        const perfCounterInferenceAvr = perfCounterInferenceRef.current.reduce((prev, cur) => {
            return prev + cur
        }) / perfCounterInferenceRef.current.length;
        (document.getElementById(PERFORMANCE_INFER_SPAN) as HTMLSpanElement).innerText = `${perfCounterInferenceAvr.toFixed(2)}`
    }

    const _updatePerfCounterReId = (counter: number) => {
        perfCounterReIdRef.current.push(counter)
        while (perfCounterReIdRef.current.length > PerformancCounter_num) {
            perfCounterReIdRef.current.shift()
        }
        const perfCounterReIdAvr = perfCounterReIdRef.current.reduce((prev, cur) => {
            return prev + cur
        }) / perfCounterReIdRef.current.length;
        (document.getElementById(PERFORMANCE_REID_SPAN) as HTMLSpanElement).innerText = `${perfCounterReIdAvr.toFixed(2)}`
    }

    const _updatePerfperfCounterCosSimId = (counter: number) => {
        perfCounterCosSimIdRef.current.push(counter)
        while (perfCounterCosSimIdRef.current.length > PerformancCounter_num) {
            perfCounterCosSimIdRef.current.shift()
        }
        const perfCounterCosSimIdAvr = perfCounterCosSimIdRef.current.reduce((prev, cur) => {
            return prev + cur
        }) / perfCounterCosSimIdRef.current.length;
        (document.getElementById(PERFORMANCE_COSSIM_SPAN) as HTMLSpanElement).innerText = `${perfCounterCosSimIdAvr.toFixed(2)}`
    }

    const _updatePerfCounterAll = (counter: number) => {
        perfCounterAllRef.current.push(counter)
        while (perfCounterAllRef.current.length > PerformancCounter_num) {
            perfCounterAllRef.current.shift()
        }
        const perfCounterAllAvr = perfCounterAllRef.current.reduce((prev, cur) => {
            return prev + cur
        }) / perfCounterAllRef.current.length;
        (document.getElementById(PERFORMANCE_ALL_SPAN) as HTMLSpanElement).innerText = `${perfCounterAllAvr.toFixed(2)}`
    }

    const _updatePerfFrameCounter = (counter: number) => {
        perfFrameCounterRef.current.push(counter)
        while (perfFrameCounterRef.current.length > PerformancCounter_num) {
            perfFrameCounterRef.current.shift()
        }
        const elapse = perfFrameCounterRef.current[perfFrameCounterRef.current.length - 1] - perfFrameCounterRef.current[0]
        const average = elapse / perfFrameCounterRef.current.length
        const fps = 1 * 1000 / average;
        // (document.getElementById(PERFORMANCE_FPS_SPAN) as HTMLSpanElement).innerText = `${fps.toFixed(2)}[${average.toFixed(2)}ms/frame]`
        (document.getElementById(PERFORMANCE_FPS_SPAN) as HTMLSpanElement).innerText = `${fps.toFixed(2)}`
    }

    const _updatePerfPersonNum = (counter: number) => {
        perfPersonNumRef.current = counter;
        (document.getElementById(PERFORMANCE_PERSON_NUM_SPAN) as HTMLSpanElement).innerText = `${perfPersonNumRef.current}`
    }

    const warmupProgressRef = useRef<WarmupProgress>({
        objectDetectionProgress: 0,
        reIdProgress: 0
    })
    const _updateWarmupProgress = (objectDetectionProgress: number, reIdProgress: number) => {
        warmupProgressRef.current = { objectDetectionProgress, reIdProgress }
        const span = document.getElementById(STATUS_WARMUP_SPAN) as HTMLSpanElement
        if (warmupProgressRef.current.objectDetectionProgress != 1) {
            span.innerText = `initializing... ${(warmupProgressRef.current.objectDetectionProgress * 100 / 2).toFixed(0)}%`
        } else if (warmupProgressRef.current.reIdProgress != 1) {
            span.innerText = `initializing... ${(warmupProgressRef.current.objectDetectionProgress * 100 / 2 + warmupProgressRef.current.reIdProgress * 100 / 2).toFixed(0)}%`
        } else {
            span.innerText = `initialized`
        }
    }

    const stopProcess = async () => {
        processIdRef.current = 0
        setProcessId(processIdRef.current)
    }

    const startProcess = async (type: MediaType, inputResolution: [number, number], processId: number) => {
        if (inputResolution[0] == 0) {
            console.log("input resolution is 0")
            return
        }
        // Params for GUI
        //// ProcessId
        processIdRef.current = processId
        setProcessId(processIdRef.current)
        const thisProcessId = processId

        //// inputShape
        const inputShapeArray = inputShape.split("x").map(x => { return Number(x) })

        //// Model File
        const modelFilePath = engineType == "onnx" ?
            `./models/yolox_nano_${inputShape}.onnx` : `./models/tfjs_yolox_nano_${inputShape}/model.json`

        const reIdModelFilePath = `./models/youtu_reid/model.json`
        const csModelFilePath = `./models/cs/model.json`

        // Target Video/Image and Target Canvas
        // const srcId = type === "image" ? "" : INPUT_VIDEO_ELEMENT
        const srcId = INPUT_VIDEO_ELEMENT
        const srcVideo = document.getElementById(srcId) as HTMLImageElement | HTMLVideoElement
        const dstCanvas = document.getElementById(RECT_CANVAS_ELEMENT) as HTMLCanvasElement
        dstCanvas.width = inputResolution[0]
        dstCanvas.height = inputResolution[1]

        // Tmp Canvas (setup width/height to input tensor shape)
        const tmpCanvas = document.getElementById(TEMPORARY_CANVAS_ID) as HTMLCanvasElement
        tmpCanvas.height = inputShapeArray[0]
        tmpCanvas.width = inputShapeArray[1]

        // Calc image size on Tmp Canvas
        const ratio = Math.min(inputShapeArray[1] / inputResolution[0], inputShapeArray[0] / inputResolution[1])
        const width = inputResolution[0] * ratio
        const height = inputResolution[1] * ratio

        // Out Canvas
        const outCanvas = document.getElementById(OUT_CANVAS_ELEMENT) as HTMLCanvasElement
        outCanvas.width = OUT_WIDTH
        outCanvas.height = OUT_HEIGHT
        const outCtx = outCanvas.getContext("2d")!

        // Show Canvas Information
        console.log("Process Configuration")
        console.log(`
            Original_Image_Size: (w:${inputResolution[0]}, h:${inputResolution[1]}), 
            Tensor_Shape: (h:${inputShapeArray[0]}, w:${inputShapeArray[1]}),
            Image Ratio and Size on Tensor: (ratio:${ratio}, w:${width}, h:${height})
            `)

        // Create Session
        const session = engineType == "onnx" ?
            await InferenceSession.create(modelFilePath)
            :
            await tf.loadGraphModel(modelFilePath);
        const reIdSession = await tf.loadGraphModel(reIdModelFilePath)
        const csSession = await tf.loadGraphModel(csModelFilePath)
        // Show Session Information
        if (engineType == "tfjs") {
            console.log("Yolox:", (session as tf.GraphModel).inputs)
            console.log("Yolox:", (session as tf.GraphModel).inputNodes)
            console.log("Yolox:", (session as tf.GraphModel).outputs)
            console.log("Yolox:", (session as tf.GraphModel).outputNodes)
        }
        if (applicationMode === "person_tracking") {
            console.log("Reid:", reIdSession.inputs)
            console.log("Reid:", reIdSession.inputNodes)
            console.log("Reid:", reIdSession.outputs)
            console.log("Reid:", reIdSession.outputNodes)

            console.log("cs:", csSession.inputs)
            console.log("cs:", csSession.inputNodes)
            console.log("cs:", csSession.outputs)
            console.log("cs:", csSession.outputNodes)
        }


        // Warmup
        if (engineType == "onnx") {
            if (applicationMode == "detection") {
                await _warmup(null, inputShapeArray, null, null, reIdChunkSizeRef.current, { _updateWarmupProgress })
            } else {
                await _warmup(null, inputShapeArray, reIdSession, csSession, reIdChunkSizeRef.current, { _updateWarmupProgress })
            }
        } else {
            if (applicationMode == "detection") {
                await _warmup(session as tf.GraphModel, inputShapeArray, null, null, reIdChunkSizeRef.current, { _updateWarmupProgress })

            } else {
                await _warmup(session as tf.GraphModel, inputShapeArray, reIdSession, csSession, reIdChunkSizeRef.current, { _updateWarmupProgress })
            }
        }

        // console.log("ONNX Input", reIdSession.inputNames)
        // console.log("ONNX Output", reIdSession.outputNames)


        // Main Process Function
        const process = async (prevBox: BoundingBox[]) => {
            frameCounterRef.current++


            const perfCounterAll_start = performance.now()
            // Copy snapshot of target video/image to target canvas (same size)
            const dstCanvasCtx = dstCanvas.getContext("2d")!
            dstCanvasCtx.drawImage(srcVideo, 0, 0, dstCanvas.width, dstCanvas.height)

            // Clear tmp canvas with grey (input tensor shape size)
            const tmpCtx = tmpCanvas.getContext("2d")!
            tmpCtx.fillStyle = "rgb(114, 114, 114)";
            tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height)

            // draw snapshot image to tmp canvas (image size resized with ratio). Dst and snapshot is same canvas.
            tmpCtx.drawImage(dstCanvas, 0, 0, width, height)

            // check skip Inference or not in this frame
            _updatePerfFrameCounter(new Date().getTime())
            // if (frameCounterRef.current % (skipRateRef.current + 1) !== 0) {
            //     if (applicationMode == "detection") {
            //         _drawDetectedBoxes(dstCanvasCtx, prevBox)
            //     } else {
            //         _drawTrackedPersondBoxes(dstCanvasCtx, prevBox)
            //     }
            //     requestAnimationFrame(() => { process(prevBox) })
            //     return
            // }

            // Inference
            let validBox: BoundingBox[] = []
            if (engineType == "onnx") {
                validBox = await _inferWithONNX(session as InferenceSession, tmpCanvas, inputShapeArray, ratio, { _updatePerfCounterInference })
            } else {
                validBox = await _inferWithTFJS(session as tf.GraphModel, tmpCanvas, inputShapeArray, ratio, { _updatePerfCounterInference })
            }
            validBox = validBox.filter(x => { return x.score > scoreThresholdRef.current })

            // NMS BoundingBox
            let targetBox = _nms(validBox)
            // console.log("mainbox:", mainBox)


            const currentTime = new Date().getTime()
            if (currentTime - selectedRectsRef.current.startTime > rotateTimeRef.current * 1000) {
                targetBox = targetBox.filter(x => { return x.classIdx === 0 }).slice(0, reIdMaxNumRef.current)
                const selectedRectIdx = select(targetBox.length, cellNumRef.current)
                const cellWidth = Math.ceil(OUT_WIDTH / selectedRectIdx.length) // cell => 映像内の箱
                const cellHeight = OUT_HEIGHT

                const newSelectedRects: SelectedRects = {
                    startTime: currentTime,
                    rects: []
                }
                selectedRectIdx.forEach(idx => {
                    const rectWidth = (targetBox[idx].endX - targetBox[idx].startX)
                    const rectHeight = (targetBox[idx].endY - targetBox[idx].startY)
                    const widthRatio = cellWidth / rectWidth
                    const heightRatio = cellHeight / rectHeight

                    // 切り抜きの大きさ計算
                    let cropWidth = 0
                    let cropHeight = 0
                    // 倍率の小さい方に依存。
                    if (widthRatio < heightRatio) {
                        cropWidth = rectWidth
                        cropHeight = (cellHeight / cellWidth) * rectWidth
                    } else {
                        cropWidth = (cellWidth / cellHeight) * rectHeight
                        cropHeight = rectHeight
                    }

                    // 切り抜きの座標計算
                    const cropCenterX = (targetBox[idx].endX + targetBox[idx].startX) / 2
                    const cropCenterY = (targetBox[idx].endY + targetBox[idx].startY) / 2
                    const cropStartX = cropCenterX - cropWidth / 2
                    const cropEndX = cropCenterX + cropWidth / 2
                    const cropStartY = cropCenterY - cropHeight / 2
                    const cropEndY = cropCenterY + cropHeight / 2

                    newSelectedRects.rects.push({
                        motId: applicationMode === "detection" ? -1 : targetBox[idx].motId,
                        score: targetBox[idx].score,
                        startX: cropStartX,
                        startY: cropStartY,
                        endX: cropEndX,
                        endY: cropEndY
                    })
                })
                selectedRectsRef.current = newSelectedRects
            }


            // Draw BoundingBox
            if (applicationMode === "detection") {
                const cellWidth = Math.ceil(OUT_WIDTH / selectedRectsRef.current.rects.length) // cell => 映像内の箱
                const cellHeight = OUT_HEIGHT
                outCtx.fillStyle = `rgba(0,0,0,255)`
                outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height)
                selectedRectsRef.current.rects.forEach((x, index) => {
                    outCtx.drawImage(dstCanvas, x.startX, x.startY, x.endX - x.startX, x.endY - x.startY,
                        cellWidth * index, 0, cellWidth, cellHeight)
                })
                _drawDetectedBoxes(dstCanvasCtx, selectedRectsRef.current)
            } else {

                // Limit person box to maxnum
                targetBox = targetBox.filter(x => { return x.classIdx === 0 }).slice(0, reIdMaxNumRef.current)
                _updatePerfPersonNum(targetBox.length)

                const humanCanvass = _cropPersonCanvas(dstCanvas, targetBox)
                const dummyCanvass = Array(reIdChunkSizeRef.current - humanCanvass.length % reIdChunkSizeRef.current).fill(0).map(_x => {
                    const dummyCanvas = document.createElement("canvas")
                    dummyCanvas.width = 128
                    dummyCanvas.height = 256
                    return dummyCanvas
                })

                const newReIds = _inferReIdWithTFJS(reIdSession, csSession, [...humanCanvass, ...dummyCanvass], humanCanvass.length, reIdChunkSizeRef.current, { _updatePerfCounterReId, _updatePerfperfCounterCosSimId })
                targetBox.forEach((x, index) => {
                    x.motId = newReIds[index]
                })
                _drawTrackedPersondBoxes(dstCanvasCtx, targetBox)
            }


            // ブラックアウトエフェクト
            const elapseTime = currentTime - selectedRectsRef.current.startTime
            const restTime = rotateTimeRef.current * 1000 - elapseTime
            if (elapseTime < 500) {
                const aplha = (500 - elapseTime) / 500
                outCtx.fillStyle = `rgba(0,0,0,${aplha})`
                outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height)
            }
            if (restTime < 500) {
                const aplha = (500 - restTime) / 500
                outCtx.fillStyle = `rgba(0,0,0,${aplha})`
                outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height)
            }


            const perfCounterAll_end = performance.now()
            const perfCounterAll = perfCounterAll_end - perfCounterAll_start
            _updatePerfCounterAll(perfCounterAll)

            if (thisProcessId === processIdRef.current) {
                // console.log(`next process loop (this:${thisProcessId}, current:${processIdRef.current})`)
                requestAnimationFrame(() => { process(targetBox) })
            } else {
                // console.log(`stop process loop (this:${thisProcessId}, current:${processIdRef.current})`)
            }
        }
        requestAnimationFrame(() => { process([]) })
    }

    const returnValue = {
        processId,
        engineType,
        inputShape,
        applicationMode,
        reIdChunkSize,
        reIdThreshold,
        reIdCacheMaxNum,
        reIdMaxNum,
        scoreThreshold,
        nMSDropOverlapThreshold,
        startProcess,
        stopProcess,
        setEnginType,
        setInputShape,
        setApplicationMode,
        setReIdChunkSize,
        setReIdThreshold,
        setReIdCacheMaxNum,
        setReIdMaxNum,
        setScoreThreshold,
        setNMSDropOverlapThreshold,

        skipRate,
        setSkipRate,
        cellNum,
        setCellNum,
        rotateTime,
        setRotateTime
    };
    return returnValue;
};


