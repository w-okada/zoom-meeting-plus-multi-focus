import React from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { SettingDialog } from "./101-1_SettingDialog";
import { AppInfoDialog } from "./101-9_AppInfoDialog";

export const Dialog = () => {
    const { frontendManagerState } = useAppState();

    return (
        <div>
            {frontendManagerState.stateControls.settingDialogCheckbox.trigger}
            {frontendManagerState.stateControls.appInfoDialogCheckbox.trigger}

            <div className="dialog-container">
                {frontendManagerState.stateControls.settingDialogCheckbox.trigger}
                <SettingDialog />
                {frontendManagerState.stateControls.appInfoDialogCheckbox.trigger}
                <AppInfoDialog />
            </div>
        </div>
    );
};
