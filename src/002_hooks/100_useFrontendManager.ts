import { useState } from "react";
import { StateControlCheckbox, useStateControlCheckbox } from "../100_components/hooks/useStateControlCheckbox";
import { MediaType } from "../const";



export type StateControls = {
    openRightSidebarCheckbox: StateControlCheckbox
    settingDialogCheckbox: StateControlCheckbox
    appInfoDialogCheckbox: StateControlCheckbox
}

type FrontendManagerState = {
    stateControls: StateControls
    mediaType: MediaType
};

export type FrontendManagerStateAndMethod = FrontendManagerState & {
    setMediaType: (val: MediaType) => void
}
export const useFrontendManager = (): FrontendManagerStateAndMethod => {
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");

    const settingDialogCheckbox = useStateControlCheckbox("setting-dialog-checkbox");

    const appInfoDialogCheckbox = useStateControlCheckbox("app-info-dialog-checkbox");


    const [mediaType, setMediaType] = useState<MediaType>("camera")

    const returnValue: FrontendManagerStateAndMethod = {
        stateControls: {
            openRightSidebarCheckbox,
            settingDialogCheckbox,
            appInfoDialogCheckbox,
        },
        mediaType,
        setMediaType,
    };
    return returnValue;
};
