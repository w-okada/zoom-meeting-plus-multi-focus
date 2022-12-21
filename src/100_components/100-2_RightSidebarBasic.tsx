import React, { useMemo } from "react";
import { ApplicationMode, EngineType, InputShape } from "../002-1_yolox/200_useInference";
import { useAppState } from "../003_provider/AppStateProvider";
import { PERFORMANCE_ALL_SPAN, PERFORMANCE_COSSIM_SPAN, PERFORMANCE_FPS_SPAN, PERFORMANCE_INFER_SPAN, PERFORMANCE_PERSON_NUM_SPAN, PERFORMANCE_REID_SPAN, STATUS_WARMUP_SPAN } from "../const";

export const BasicSetting = () => {
    const { inferenceState, frontendManagerState, deviceManagerState } = useAppState()


    /***********************
     * Performance Area
     ***********************/
    const performancFPSRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">FPS:</div>
                <div className="sidebar-content-row-label"><span id={PERFORMANCE_FPS_SPAN}></span></div>
            </div>
        )
    }, [])
    const performanceAllRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">All:</div>
                <div className="sidebar-content-row-label"><span id={PERFORMANCE_ALL_SPAN}></span>ms</div>
            </div>
        )
    }, [])
    const performanceInferenceRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label pad-left-1">Inference:</div>
                <div className="sidebar-content-row-label"><span id={PERFORMANCE_INFER_SPAN}></span>ms</div>
            </div>
        )
    }, [])


    const performanceReIdRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label pad-left-1">ReId:</div>
                <div className="sidebar-content-row-label"><span id={PERFORMANCE_REID_SPAN}></span>ms</div>
            </div>
        )
    }, [])

    const performanceCosSimRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label pad-left-1">CosSim:</div>
                <div className="sidebar-content-row-label"><span id={PERFORMANCE_COSSIM_SPAN}></span>ms</div>
            </div>
        )
    }, [])
    const performancePersonNumRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label pad-left-1">Person:</div>
                <div className="sidebar-content-row-label"><span id={PERFORMANCE_PERSON_NUM_SPAN}></span></div>
            </div>
        )
    }, [])




    const statusWarmupRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label pad-left-1">Status:</div>
                <div className="sidebar-content-row-label"><span id={STATUS_WARMUP_SPAN}></span></div>
            </div>
        )
    }, [])


    /***********************
     * Select Engine Area
     ***********************/
    const selectEngineRow = useMemo(() => {
        const options = Object.keys(EngineType).map(x => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            )
        })

        const select = (
            <select
                value={inferenceState.engineType}
                onChange={(e) => {
                    const newEnginType = e.target.value as EngineType
                    inferenceState.setEnginType(newEnginType)
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">Engine Type:</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>

        )
    }, [inferenceState.engineType])

    const selectInputShapeRow = useMemo(() => {
        const options = Object.keys(InputShape).map(x => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            )
        })

        const select = (
            <select
                value={inferenceState.inputShape}
                onChange={(e) => {
                    const newInputShape = e.target.value as InputShape
                    inferenceState.setInputShape(newInputShape)
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">InputShape:</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>

        )
    }, [inferenceState.inputShape])


    const selectApplicationModeRow = useMemo(() => {
        const options = Object.keys(ApplicationMode).map(x => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            )
        })

        const select = (
            <select
                value={inferenceState.applicationMode}
                onChange={(e) => {
                    const newApplicationMode = e.target.value as ApplicationMode
                    inferenceState.setApplicationMode(newApplicationMode)
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">mode:</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>

        )
    }, [inferenceState.applicationMode])

    const setCellNumRow = useMemo(() => {
        const options = [1, 2, 3, 4].map(x => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            )
        })

        const select = (
            <select
                value={inferenceState.cellNum}
                onChange={(e) => {
                    inferenceState.setCellNum(Number(e.target.value))
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">cells:</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>

        )
    }, [inferenceState.cellNum])


    const setRotateTimeRow = useMemo(() => {
        const options = [3, 5, 10].map(x => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            )
        })

        const select = (
            <select
                value={inferenceState.rotateTime}
                onChange={(e) => {
                    inferenceState.setRotateTime(Number(e.target.value))
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">interval:</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>

        )
    }, [inferenceState.rotateTime])


    const processButtonRow = useMemo(() => {
        const buttonLabel = inferenceState.processId === 0 ? "start process" : "stop process"
        const buttonClass = inferenceState.processId === 0 ? "sidebar-content-row-button" : "sidebar-content-row-button-activated"
        const butonAction = inferenceState.processId === 0 ?
            () => {
                inferenceState.startProcess(frontendManagerState.mediaType, deviceManagerState.inputResolution, new Date().getTime())
            }
            :
            () => {
                inferenceState.stopProcess()
            }

        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label"></div>
                <div className="sidebar-content-row-buttons">
                    <div className={buttonClass} onClick={butonAction}>{buttonLabel}</div>
                </div>
            </div>
        )
    }, [frontendManagerState.mediaType, deviceManagerState.inputResolution, inferenceState.processId, inferenceState.engineType, inferenceState.inputShape, inferenceState.applicationMode])



    return (
        <div className="sidebar-content">
            <div className="sidebar-content-row-dividing"></div>
            <div className="sidebar-content-row-label-header">
                Inference Engine
            </div>
            {selectEngineRow}
            {selectInputShapeRow}
            {selectApplicationModeRow}
            {setCellNumRow}
            {setRotateTimeRow}
            <div className="sidebar-content-row-dividing"></div>
            {processButtonRow}
            {statusWarmupRow}

            <div className="sidebar-content-row-label-header">
                Performance
            </div>
            {performancFPSRow}
            {performanceAllRow}
            {performanceInferenceRow}
            {performanceReIdRow}
            {performanceCosSimRow}
            {performancePersonNumRow}





        </div>
    );
};
