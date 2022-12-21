import React, { useContext, useEffect } from "react";
import { ReactNode } from "react";
import { DeviceManagerStateAndMethod, useDeviceManager } from "../002_hooks/301_useDeviceManager";
import { BackendManagerStateAndMethod, useBackendManager } from "../002_hooks/002_useBackendManager";
import { FrontendManagerStateAndMethod, useFrontendManager } from "../002_hooks/100_useFrontendManager";
import { ResourceManagerStateAndMethod, useResourceManager } from "../002_hooks/003_useResourceManager";
import { useZoomSDK, ZoomSDKStateAndMethod } from "../002_hooks/200_useZoomSDK";
import { BrowserProxyStateAndMethod, useBrowserProxy } from "../002_hooks/300_useBrowserProxy";
import { InferenceStateAndMethod, useInference } from "../002-1_yolox/200_useInference";
type Props = {
    children: ReactNode;
};

interface AppStateValue {
    backendManagerState: BackendManagerStateAndMethod;
    resourceManagerState: ResourceManagerStateAndMethod;

    zoomSDKState: ZoomSDKStateAndMethod;
    browserProxyState: BrowserProxyStateAndMethod;
    deviceManagerState: DeviceManagerStateAndMethod;

    frontendManagerState: FrontendManagerStateAndMethod;

    inferenceState: InferenceStateAndMethod
}

const AppStateContext = React.createContext<AppStateValue | null>(null);
export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

export const AppStateProvider = ({ children }: Props) => {
    const backendManagerState = useBackendManager();
    const resourceManagerState = useResourceManager();
    const zoomSDKState = useZoomSDK({ backendManagerState });
    const browserProxyState = useBrowserProxy({
        isJoined: zoomSDKState.isJoined
    });
    const deviceManagerState = useDeviceManager({ browserProxyState });
    const frontendManagerState = useFrontendManager();
    const inferenceState = useInference();


    useEffect(() => {
        inferenceState.stopProcess()
    }, [
        frontendManagerState.mediaType,
        deviceManagerState.inputResolution,
        inferenceState.engineType,
        inferenceState.inputShape,
        inferenceState.applicationMode
    ])


    const providerValue = {
        deviceManagerState,
        backendManagerState,
        resourceManagerState,
        zoomSDKState,
        browserProxyState,
        frontendManagerState,
        inferenceState
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
