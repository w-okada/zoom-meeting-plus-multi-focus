import { useMemo, useRef, useState } from "react"
import { DeviceInfo, DeviceManager } from "../001_clients_and_managers/001_DeviceManager"
import { BrowserProxyStateAndMethod } from "./300_useBrowserProxy";

export type UseDeviceManagerProps = {
    browserProxyState: BrowserProxyStateAndMethod;
}

type DeviceManagerState = {
    lastUpdateTime: number
    audioInputDevices: DeviceInfo[]
    videoInputDevices: DeviceInfo[]
    audioOutputDevices: DeviceInfo[]

    videoInputDeviceId: string | null
    inputResolution: [number, number]
}
export type DeviceManagerStateAndMethod = DeviceManagerState & {
    reloadDevices: () => Promise<void>
    setVideoElement: (elem: HTMLVideoElement) => Promise<void>
    setVideoInputDeviceId: (val: string | null) => void
    setVideoFileURL: (val: string) => void
}


export const useDeviceManager = (props: UseDeviceManagerProps): DeviceManagerStateAndMethod => {
    const [lastUpdateTime, setLastUpdateTime] = useState(0)
    const [videoInputDeviceId, _setVideoInputDeviceId] = useState<string | null>(null)
    const [videoElement, _setVideoElement] = useState<HTMLVideoElement | null>(null)
    const [inputResolution, setInputResolution] = useState<[number, number]>([0, 0])

    const mediaStreamRef = useRef<MediaStream | null>(null)

    const deviceManager = useMemo(() => {
        const manager = new DeviceManager()
        manager.setUpdateListener({
            update: () => {
                setLastUpdateTime(new Date().getTime())
            }
        })
        manager.reloadDevices(props.browserProxyState.enumerateDevices)
        return manager
    }, [props.browserProxyState.enumerateDevices])

    // () Enumerate
    const reloadDevices = useMemo(() => {
        return async () => {
            deviceManager.reloadDevices(props.browserProxyState.enumerateDevices)
        }
    }, [props.browserProxyState.enumerateDevices])

    // () set video
    const setVideoElement = async (elem: HTMLVideoElement) => {
        if (videoInputDeviceId) {
            const ms = await props.browserProxyState.getUserMedia({
                video: {
                    deviceId: videoInputDeviceId
                }
            })
            elem.srcObject = ms
        }
        _setVideoElement(elem)
    }
    const setVideoInputDeviceId = async (val: string | null) => {
        console.log("setvideo", val, videoElement)
        if (val && videoElement) {
            console.log(val, videoElement)
            const ms = await props.browserProxyState.getUserMedia({
                video: {
                    deviceId: val
                }
            })

            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(x => x.stop())
                mediaStreamRef.current = null
            }

            videoElement.pause()
            videoElement.onloadedmetadata = function () {
                setInputResolution([videoElement.videoWidth, videoElement.videoHeight])
            }
            videoElement.srcObject = ms
            mediaStreamRef.current = ms
            videoElement.play()
        } else if (videoElement) {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(x => x.stop())
                mediaStreamRef.current = null
            }
            videoElement.srcObject = null

            videoElement.pause()
        }

        _setVideoInputDeviceId(val)
    }

    const setVideoFileURL = (url: string) => {
        videoElement.pause()
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(x => x.stop())
            mediaStreamRef.current = null
        }
        videoElement.onloadedmetadata = function () {
            setInputResolution([videoElement.videoWidth, videoElement.videoHeight])
        }
        if (videoElement) {
            videoElement.src = url
            videoElement.play()
        }
    }

    return {
        lastUpdateTime,
        audioInputDevices: deviceManager.realAudioInputDevices,
        videoInputDevices: deviceManager.realVideoInputDevices,
        audioOutputDevices: deviceManager.realAudioOutputDevices,

        videoInputDeviceId,
        inputResolution,
        reloadDevices,
        setVideoElement,
        setVideoInputDeviceId,
        setVideoFileURL
    }
}