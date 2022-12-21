import { StateControlCheckbox, useStateControlCheckbox } from "../100_components/hooks/useStateControlCheckbox";



export type StateControls = {
    openRightSidebarCheckbox: StateControlCheckbox
    settingDialogCheckbox: StateControlCheckbox
    appInfoDialogCheckbox: StateControlCheckbox
}

type FrontendManagerState = {
    stateControls: StateControls
};

export type FrontendManagerStateAndMethod = FrontendManagerState & {
    dummy: string
}
export const useFrontendManager = (): FrontendManagerStateAndMethod => {
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");

    const settingDialogCheckbox = useStateControlCheckbox("setting-dialog-checkbox");

    const appInfoDialogCheckbox = useStateControlCheckbox("app-info-dialog-checkbox");

    const returnValue: FrontendManagerStateAndMethod = {
        stateControls: {
            openRightSidebarCheckbox,
            settingDialogCheckbox,
            appInfoDialogCheckbox,
        },
        dummy: ""

    };
    return returnValue;
};
