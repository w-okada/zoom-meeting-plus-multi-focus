import { useRef, useState } from "react";
import { BoundingBox } from "./200_useInference";

export const useNMS = () => {
    const nMSDropOverlapThresholdRef = useRef<number>(0.5)
    const [nMSDropOverlapThreshold, _setNMSDropOverlapThreshold] = useState<number>(nMSDropOverlapThresholdRef.current)
    const setNMSDropOverlapThreshold = (val: number) => {
        nMSDropOverlapThresholdRef.current = val
        _setNMSDropOverlapThreshold(nMSDropOverlapThresholdRef.current)
    }

    const _nms = (validBox: BoundingBox[]) => {
        const mainBox: BoundingBox[] = []
        const argsortIndex = validBox.map((x, index) => {
            return { x, index }
        }).sort((a, b) => {
            if (a.x.score < b.x.score) {
                return 1;
            }
            if (a.x.score > b.x.score) {
                return -1;
            }
            return 0
        }).map(x => { return x.index })

        for (let i = 0; i < argsortIndex.length; i++) {
            const targetIndex = argsortIndex[i]
            const target = validBox[targetIndex]
            if (target.valid == false) {
                continue
            }
            mainBox.push(target)
            for (let j = i + 1; j < argsortIndex.length; j++) {
                const subIndex = argsortIndex[j]
                const sub = validBox[subIndex]

                if (sub.valid == false) {
                    continue
                }
                const x1 = Math.max(target.startX, sub.startX)
                const y1 = Math.max(target.startY, sub.startY)
                const x2 = Math.min(target.endX, sub.endX)
                const y2 = Math.min(target.endY, sub.endY)
                const w = Math.max(0.0, x2 - x1 + 1)
                const h = Math.max(0.0, y2 - y1 + 1)
                const intersect = w * h
                const overlap = intersect / (target.area + sub.area - intersect)
                if (overlap > nMSDropOverlapThresholdRef.current) {
                    sub.valid = false
                }
            }
        }
        return mainBox
    }
    return { _nms, nMSDropOverlapThreshold, setNMSDropOverlapThreshold }
}
