import React, { useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";

export const MainArea = () => {
    const { frontendManagerState } = useAppState();

    const mainArea = useMemo(() => {
        return (
            <>
                {frontendManagerState.stateControls.openRightSidebarCheckbox.trigger}
                <div className="main-area">
                    <div id="meetingSDKElement-0"></div>
                    <div id="meetingSDKElement-1"></div>
                    <div id="meetingSDKElement-2"></div>
                </div>
            </>
        );
    }, []);
    return mainArea;
};
