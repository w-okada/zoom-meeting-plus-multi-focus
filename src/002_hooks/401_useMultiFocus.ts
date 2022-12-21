import { useRef } from "react"
import { INPUT_VIDEO_ELEMENT, OUT_CANVAS_ELEMENT, OUT_HEIGHT, OUT_WIDTH, RECT_CANVAS_ELEMENT, SNAP_CANVAS_ELEMENT } from "../const"

type MultiFocusState = {
}
export type MultiFocusStateAndMethod = MultiFocusState & {
    stop: () => void
    start: () => void
}

export const useMultiFocus = (): MultiFocusStateAndMethod => {
    const processIdRef = useRef<number>(0)
    const stop = () => {
        processIdRef.current = 0
    }
    const start = () => {
        if (processIdRef.current != 0) {
            alert("already started")
            return
        }
        processIdRef.current = new Date().getTime()
        const thisProccessId = processIdRef.current


        const videoElem = document.getElementById(INPUT_VIDEO_ELEMENT) as HTMLVideoElement
        const snapElem = document.getElementById(SNAP_CANVAS_ELEMENT) as HTMLCanvasElement
        const rectElem = document.getElementById(RECT_CANVAS_ELEMENT) as HTMLCanvasElement
        const outElem = document.getElementById(OUT_CANVAS_ELEMENT) as HTMLCanvasElement
        outElem.width = OUT_WIDTH
        outElem.height = OUT_HEIGHT

        const draw = async () => {
            const outCtx = outElem.getContext("2d")!
            outCtx.drawImage(videoElem, 0, 0, outElem.width, outElem.height)
            if (processIdRef.current == thisProccessId) {
                requestAnimationFrame(draw)
            }
        }
        draw()
    }
    return {
        start,
        stop
    }
}
