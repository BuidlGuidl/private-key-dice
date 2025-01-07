import Ably from "ably";
import serverConfig from "~~/server.config";

export const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY || serverConfig.ably_api_key });
