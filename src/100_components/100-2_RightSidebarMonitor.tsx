import React, { useEffect, useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { INPUT_VIDEO_ELEMENT, OUT_CANVAS_ELEMENT, RECT_CANVAS_ELEMENT, TEMPORARY_CANVAS_ID } from "../const";


export const RightSidebarMonitor = () => {
    const { deviceManagerState } = useAppState();


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
                    <div className="sidebar-video-container">
                        <video className="sidebar-video" id={INPUT_VIDEO_ELEMENT}></video>
                    </div>
                    <div className="sidebar-video-container">
                        <canvas className="sidebar-video" id={RECT_CANVAS_ELEMENT}></canvas>
                    </div>
                    <div className="sidebar-video-container">
                        <canvas className="sidebar-video" id={OUT_CANVAS_ELEMENT}></canvas>
                    </div>
                    <div className="sidebar-video-container sidebar-video-container-hide">
                        <canvas className="sidebar-video" id={TEMPORARY_CANVAS_ID}></canvas>
                    </div>
                </div>
            </div>

        </>
    );
};
