import axios from "axios";
import logger from "./logger";

interface MontageCompletePayload {
  filename: string;
  user: Record<string, unknown>;
}

export async function notifyVideoMontageComplete(
  montageVideoFilename: string,
  user: Record<string, unknown>,
  token: string
): Promise<unknown> {
  const baseUrl = process.env.URL_LOCAL_KV_API_FOR_VIDEO_MONTAGE_MAKER;

  if (!baseUrl) {
    throw new Error("Missing URL_LOCAL_KV_API_FOR_VIDEO_MONTAGE_MAKER environment variable");
  }

  const url = `${baseUrl}/videos/montage-service/video-completed-notify-user`;
  const requestData: MontageCompletePayload = {
    filename: montageVideoFilename,
    user,
  };

  logger.info(`📡 Notifying API that montage is complete: ${url}`);

  try {
    const response = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });
    logger.info("✅ Montage completion notification sent");
    return response.data;
  } catch (error: any) {
    logger.error(`❌ Error sending montage completion request: ${error?.message}`);
    if (error?.response?.data) {
      logger.error(`📥 API Response Error Data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}
