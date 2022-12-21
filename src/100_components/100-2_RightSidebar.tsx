import React, { useEffect, useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { AdvancedSetting } from "./100-2_RightSidebarAdvance";
import { BasicSetting } from "./100-2_RightSidebarBasic";
import { RightSidebarMonitor } from "./100-2_RightSidebarMonitor";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";

export const RightSidebar = () => {
    const { frontendManagerState, zoomSDKState } = useAppState();
    const sidebarAccordionZoomCheckbox = useStateControlCheckbox("sidebar-accordion-zoom-checkbox");
    const sidebarAccordionMonitorCheckbox = useStateControlCheckbox("sidebar-accordion-monitor-checkbox");

    const sidebarAccordionBasicSettingCheckBox = useStateControlCheckbox("basic-setting");
    const sidebarAccordionAdvancedSettingCheckBox = useStateControlCheckbox("adviced-setting");

    /**
     * (1)According Actions
     */
    //// (1-1) accordion button
    const accodionButtonForZoom = useMemo(() => {
        const accodionButtonForZoomProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionZoomCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForZoomProps}></HeaderButton>;
    }, []);
    //// (1-2) monitor button
    const accodionButtonForMonitor = useMemo(() => {
        const accodionButtonForMonitoProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionMonitorCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForMonitoProps}></HeaderButton>;
    }, []);

    const accodionButtonForBasicSetting = useMemo(() => {
        const accodionButtonForBasicSettingProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionBasicSettingCheckBox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForBasicSettingProps}></HeaderButton>;
    }, []);


    const accodionButtonForAdvancedSetting = useMemo(() => {
        const accodionButtonForAdvancedSettingProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionAdvancedSettingCheckBox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForAdvancedSettingProps}></HeaderButton>;
    }, []);

    /**
     * (2)According Initial State
     */
    useEffect(() => {
        sidebarAccordionZoomCheckbox.updateState(true);
        sidebarAccordionMonitorCheckbox.updateState(true);
    }, []);

    /**
     * (3) User Operation
     */
    //// (3-1) Join Operation
    const joinClicked = async () => {
        if (!zoomSDKState.joinZoom) {
            return;
        }
        const usernameInput = document.getElementById("username") as HTMLInputElement;
        const meetingId = document.getElementById("meeting-id") as HTMLInputElement;
        const meetingPw = document.getElementById("meeting-pw") as HTMLInputElement;
        const secret = document.getElementById("secret") as HTMLInputElement;

        console.log(usernameInput.value, meetingId.value, meetingPw.value, secret.value)
        await zoomSDKState.joinZoom(usernameInput.value, meetingId.value, meetingPw.value, secret.value);
    };

    //////////////////
    // Rendering   ///
    //////////////////
    return (
        <>
            {frontendManagerState.stateControls.openRightSidebarCheckbox.trigger}
            <div className="right-sidebar">
                {sidebarAccordionZoomCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Zoom</div>
                        <div className="caret"> {accodionButtonForZoom}</div>
                    </div>
                    <div className="sidebar-content">
                        <div className="sidebar-zoom-area">
                            <div className="sidebar-zoom-area-input">
                                <input type="text" className="sidebar-zoom-area-text" id="username" />
                                <div className="sidebar-zoom-area-label">username</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <input type="text" className="sidebar-zoom-area-text" id="meeting-id" />
                                <div className="sidebar-zoom-area-label">meeting num</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <input type="password" className="sidebar-zoom-area-password" id="meeting-pw" />
                                <div className="sidebar-zoom-area-label">password</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <input type="password" className="sidebar-zoom-area-password" id="secret" />
                                <div className="sidebar-zoom-area-label">secret</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <div
                                    className="sidebar-zoom-area-button"
                                    onClick={() => {
                                        joinClicked();
                                    }}
                                >
                                    join
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {sidebarAccordionBasicSettingCheckBox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title">Setting</div>
                        <div className="caret"> {accodionButtonForBasicSetting}</div>
                    </div>
                    <BasicSetting></BasicSetting>
                </div>

                {sidebarAccordionMonitorCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Monitor</div>
                        <div className="caret"> {accodionButtonForMonitor}</div>
                    </div>
                    <RightSidebarMonitor></RightSidebarMonitor>
                </div>


                {sidebarAccordionAdvancedSettingCheckBox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title">Advanced Setting</div>
                        <div className="caret"> {accodionButtonForAdvancedSetting}</div>
                    </div>
                    <AdvancedSetting></AdvancedSetting>
                </div>

            </div>
        </>
    );
};
