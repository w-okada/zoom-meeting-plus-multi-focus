import React, { useMemo } from "react";
import { ReIdCacheMaxNums } from "../002-1_yolox/200-2_inferReIdWithTFJS";
import { ReIdChunkSizes, ReIdMaxNums } from "../002-1_yolox/200_useInference";
import { useAppState } from "../003_provider/AppStateProvider";

export const AdvancedSetting = () => {
    const { inferenceState } = useAppState()

    /***********************
     *  Threshold Area
     ***********************/
    const skipRateRow = useMemo(() => {
        const input = (
            <input type="range"
                max={5}
                min={0}
                step={1}
                value={inferenceState.skipRate}
                onChange={(e) => {
                    inferenceState.setSkipRate(Number(e.target.value))
                }}
            />
        )
        return (
            <div className="sidebar-content-row-4-5-1">
                <div className="sidebar-content-row-label">
                    skip rate
                </div>
                <div className="sidebar-content-row-input">
                    {input}
                </div>
                <div className="sidebar-content-row-label">{inferenceState.skipRate}</div>
            </div>
        )
    }, [inferenceState.skipRate])

    const reIdThresholdRow = useMemo(() => {
        const input = (
            <input type="range"
                max={1}
                min={0.1}
                step={0.1}
                value={inferenceState.reIdThreshold}
                onChange={(e) => {
                    inferenceState.setReIdThreshold(Number(e.target.value))
                }}
            />
        )
        return (
            <div className="sidebar-content-row-4-5-1">
                <div className="sidebar-content-row-label">
                    ReId
                </div>
                <div className="sidebar-content-row-input">
                    {input}
                </div>
                <div className="sidebar-content-row-label">{inferenceState.reIdThreshold}</div>
            </div>
        )
    }, [inferenceState.reIdThreshold])

    const scoreThresholdRow = useMemo(() => {
        const input = (
            <input type="range"
                max={1}
                min={0.1}
                step={0.1}
                value={inferenceState.scoreThreshold}
                onChange={(e) => {
                    inferenceState.setScoreThreshold(Number(e.target.value))
                }}
            />
        )
        return (
            <div className="sidebar-content-row-4-5-1">
                <div className="sidebar-content-row-label">
                    Detect Score
                </div>
                <div className="sidebar-content-row-input">
                    {input}
                </div>
                <div className="sidebar-content-row-label">{inferenceState.scoreThreshold}</div>
            </div>
        )
    }, [inferenceState.scoreThreshold])

    const nMSDropOverlapThresholdRow = useMemo(() => {
        const input = (
            <input type="range"
                max={1}
                min={0.1}
                step={0.1}
                value={inferenceState.nMSDropOverlapThreshold}
                onChange={(e) => {
                    inferenceState.setNMSDropOverlapThreshold(Number(e.target.value))
                }}
            />
        )
        return (
            <div className="sidebar-content-row-4-5-1">
                <div className="sidebar-content-row-label">
                    NMS Overlap
                </div>
                <div className="sidebar-content-row-input">
                    {input}
                </div>
                <div className="sidebar-content-row-label">{inferenceState.nMSDropOverlapThreshold}</div>
            </div>
        )
    }, [inferenceState.nMSDropOverlapThreshold])

    /***********************
     *  Threshold Area
     ***********************/

    const reIdMaxNumRow = useMemo(() => {
        const options = Object.keys(ReIdMaxNums).map(x => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            )
        })

        const select = (
            <select
                value={inferenceState.reIdMaxNum}
                onChange={(e) => {
                    inferenceState.setReIdMaxNum(e.target.value as unknown as ReIdMaxNums);
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">ReId max-num:</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>

        )
    }, [inferenceState.reIdMaxNum])


    const reIdChunkSizeRow = useMemo(() => {
        const options = Object.keys(ReIdChunkSizes).map(x => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            )
        })

        const select = (
            <select
                value={inferenceState.reIdChunkSize}
                onChange={(e) => {
                    inferenceState.setReIdChunkSize(e.target.value as unknown as ReIdChunkSizes);
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">Feat-calc chunk:</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>

        )
    }, [inferenceState.reIdChunkSize])


    const reIdCacheMaxRow = useMemo(() => {
        const options = Object.keys(ReIdCacheMaxNums).map(x => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            )
        })

        const select = (
            <select
                value={inferenceState.reIdCacheMaxNum}
                onChange={(e) => {
                    inferenceState.setReIdCacheMaxNum(e.target.value as unknown as ReIdCacheMaxNums);
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">ReId cache-num</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>

        )
    }, [inferenceState.reIdCacheMaxNum])




    return (
        <div className="sidebar-content">
            <div className="sidebar-content-row-label-header">
                Thresholds
            </div>
            {skipRateRow}
            {scoreThresholdRow}
            {nMSDropOverlapThresholdRow}
            {reIdThresholdRow}
            <div className="sidebar-content-row-label-header">
                Configuration
            </div>
            {reIdMaxNumRow}
            {reIdChunkSizeRow}
            {reIdCacheMaxRow}




        </div>
    );
};
