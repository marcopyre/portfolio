import { logger } from "@/utils/logger";

export function getCorsHeaders() {
  const headers = {
    "Access-Control-Allow-Origin": "https://marcopyre.github.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };

  logger.debug('CORS headers generated', headers);
  return headers;
}