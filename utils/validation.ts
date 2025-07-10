import { MAX_MESSAGES } from "@/config/constants";
import { logger } from "./logger";

export function validateMessages(messages: any): {
  valid: boolean;
  error?: string;
} {
  logger.debug("Validating messages", { messagesType: typeof messages });

  if (!Array.isArray(messages)) {
    logger.warn("Messages validation failed: not an array");
    return { valid: false, error: "Messages must be an array" };
  }

  if (messages.length === 0) {
    logger.warn("Messages validation failed: empty array");
    return { valid: false, error: "Messages array cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    logger.warn("Messages validation failed: too many messages", {
      count: messages.length,
      max: MAX_MESSAGES,
    });
    return { valid: false, error: `Too many messages (max: ${MAX_MESSAGES})` };
  }

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (!message.role || !message.content) {
      logger.warn("Messages validation failed: invalid message structure", {
        index: i,
        message,
      });
      return { valid: false, error: `Invalid message structure at index ${i}` };
    }
  }

  logger.debug("Messages validation passed", { messageCount: messages.length });
  return { valid: true };
}

export function validateEnvironment(): { valid: boolean; error?: string } {
  if (!process.env.HF_TOKEN) {
    logger.error("Environment validation failed: missing HF_TOKEN");
    return { valid: false, error: "Missing HF_TOKEN environment variable" };
  }

  logger.debug("Environment validation passed");
  return { valid: true };
}
