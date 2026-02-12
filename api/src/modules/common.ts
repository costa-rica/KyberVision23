import fs from "fs";
import path from "path";
import { Ping } from "kybervision23db";

interface ValidationResult {
  isValid: boolean;
  missingKeys: string[];
}

export function checkBody(body: Record<string, any>, keys: string[]): boolean {
  let isValid = true;

  for (const field of keys) {
    if (!body[field] || body[field] === "") {
      isValid = false;
    }
  }

  return isValid;
}

export function checkBodyReturnMissing(
  body: Record<string, any>,
  keys: string[],
): ValidationResult {
  let isValid = true;
  let missingKeys: string[] = [];

  for (const field of keys) {
    if (!body[field] || body[field] === "") {
      isValid = false;
      missingKeys.push(field);
    }
  }

  return { isValid, missingKeys };
}

export function writeRequestArgs(
  requestBody: Record<string, any>,
  fileNameSuffix: string,
): void {
  // 🔹 Write request arguments to a JSON file
  const testDir = process.env.PATH_TEST_REQUEST_ARGS;
  if (testDir) {
    try {
      // Ensure the directory exists
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Generate file name with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .split("T")[1]
        .split("Z")[0]; // HHMMSS format
      const filePath = path.join(
        testDir,
        `request_${timestamp}_${fileNameSuffix}.json`,
      );

      // Write request body to file
      fs.writeFileSync(filePath, JSON.stringify(requestBody, null, 2), "utf8");
      console.log(`✅ Request arguments saved to: ${filePath}`);
    } catch (err: any) {
      console.error("❌ Error writing request arguments file:", err);
    }
  } else {
    console.warn(
      "⚠️ PATH_TEST_REQUEST_ARGS is not set, skipping request logging.",
    );
  }
}

/**
 * Record a device/server time sample for drift analysis.
 *
 * @param args.userId                The user's id (from auth/context).
 * @param args.endpointName          Endpoint label (e.g., "POST /auth/login").
 * @param args.userDeviceTimestamp   Timestamp sent by the device (UTC ISO or Date).
 * @param args.serverTimestamp       Optional server-side timestamp (UTC). If omitted, uses now().
 * @param args.deviceName            Optional device name (e.g., "iPhone 15 Pro").
 * @param args.deviceType            Optional device type (e.g., "Tablet").
 * @param args.isTablet              Optional flag indicating if device is a tablet.
 * @param args.manufacturer          Optional device manufacturer (e.g., "Apple").
 * @param args.modelName             Optional device model name.
 * @param args.osName                Optional OS name (e.g., "iOS").
 * @param args.osVersion             Optional OS version.
 *
 * @returns { success, pingId?, error? }
 */
export async function recordPing(args: {
  userId: number;
  endpointName: string;
  userDeviceTimestamp: string | Date;
  serverTimestamp?: Date;
  deviceName?: string;
  deviceType?: string;
  isTablet?: boolean;
  manufacturer?: string;
  modelName?: string;
  osName?: string;
  osVersion?: string;
}): Promise<{ success: boolean; pingId?: number; error?: string }> {
  try {
    // --- Validate required primitives ---
    const { userId, endpointName } = args;
    if (
      typeof userId !== "number" ||
      Number.isNaN(userId) ||
      !endpointName ||
      typeof endpointName !== "string"
    ) {
      return { success: false, error: "Invalid userId or endpointName." };
    }

    // --- Normalize timestamps (expect UTC) ---
    const deviceTs =
      args.userDeviceTimestamp instanceof Date
        ? args.userDeviceTimestamp
        : new Date(args.userDeviceTimestamp);

    if (!deviceTs || isNaN(deviceTs.getTime())) {
      return { success: false, error: "Invalid userDeviceTimestamp." };
    }

    // If not provided, prefer server wall-clock now (UTC)
    const serverTs = args.serverTimestamp ?? new Date();

    // --- Persist row ---
    const row = await Ping.create({
      userId,
      endpointName,
      userDeviceTimestamp: deviceTs, // stored as DATE; treat as UTC
      serverTimestamp: serverTs, // can omit to use DB default; here we pass in for explicitness
      deviceName: args.deviceName,
      deviceType: args.deviceType,
      isTablet: args.isTablet,
      manufacturer: args.manufacturer,
      modelName: args.modelName,
      osName: args.osName,
      osVersion: args.osVersion,
    });

    return { success: true, pingId: (row as any).id };
  } catch (err: any) {
    console.error("❌ recordPing error:", err?.message || err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}
