import * as Device from "expo-device";

/**
 * Collects device information for analytics and user tracking
 * @returns Object containing device information fields
 */
export const getDeviceInfo = () => {
	return {
		deviceName: Device.deviceName || "Unknown",
		deviceType: Device.deviceType !== null ? String(Device.deviceType) : "Unknown",
		isTablet: Device.deviceType === Device.DeviceType.TABLET,
		manufacturer: Device.manufacturer || "Unknown",
		modelName: Device.modelName || "Unknown",
		osName: Device.osName || "Unknown",
		osVersion: Device.osVersion || "Unknown",
	};
};
