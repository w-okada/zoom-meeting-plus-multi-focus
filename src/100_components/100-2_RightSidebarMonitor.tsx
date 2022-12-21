import React, { useEffect, useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { INPUT_VIDEO_ELEMENT, OUT_CANVAS_ELEMENT, RECT_CANVAS_ELEMENT, SNAP_CANVAS_ELEMENT } from "../const";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";


export const RightSidebarMonitor = () => {
    const { zoomSDKState, deviceManagerState, multiFocusState } = useAppState();
    const sidebarAccordionZoomCheckbox = useStateControlCheckbox("sidebar-accordion-zoom-checkbox");
    const sidebarAccordionMonitorCheckbox = useStateControlCheckbox("sidebar-accordion-monitor-checkbox");

    useEffect(() => {
        const elem = document.getElementById(INPUT_VIDEO_ELEMENT) as HTMLVideoElement
        deviceManagerState.setVideoElement(elem)
    }, [])

    //////////////////
    // Rendering   ///
    //////////////////
    return (
        <>
            <div className="sidebar-content">
                <div className="sidebar-zoom-area">

                    <div className="sidebar-zoom-area-input">
                        <div
                            className="sidebar-zoom-area-button"
                            onClick={() => {
                                multiFocusState.start();
                            }}
                        >
                            start process
                        </div>
                    </div>
                    <div className="sidebar-video-container">
                        <video className="sidebar-video" id={INPUT_VIDEO_ELEMENT}></video>
                    </div>
                    <div className="sidebar-video-container">
                        <canvas className="sidebar-video" id={SNAP_CANVAS_ELEMENT}></canvas>
                    </div>
                    <div className="sidebar-video-container">
                        <canvas className="sidebar-video" id={RECT_CANVAS_ELEMENT}></canvas>
                    </div>
                    <div className="sidebar-video-container">
                        <canvas className="sidebar-video" id={OUT_CANVAS_ELEMENT}></canvas>
                    </div>
                </div>
            </div>

        </>
    );
};
