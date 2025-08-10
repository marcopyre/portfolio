import { type NextRequest, NextResponse } from "next/server";
import { ChatService } from "../../../services/chat-service";
import { APIResponse, FunctionResponse } from "../../../types";
import { getCorsHeaders } from "@/utils/cors";
import { logger } from "@/utils/logger";
import { validateEnvironment, validateMessages } from "@/utils/validation";

export async function OPTIONS() {
  logger.info("OPTIONS request received");
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  logger.info("POST request received", { requestId });

  try {
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
      logger.error("Environment validation failed", {
        requestId,
        error: envValidation.error,
      });
      return NextResponse.json(
        { error: "Configuration manquante" },
        { status: 500, headers: getCorsHeaders() }
      );
    }

    const { messages, useRAG = true } = await request.json();
    logger.info("Request parsed", {
      requestId,
      useRAG,
      messageCount: Array.isArray(messages) ? messages.length : "invalid",
    });

    const messageValidation = validateMessages(messages);
    if (!messageValidation.valid) {
      logger.error("Message validation failed", {
        requestId,
        error: messageValidation.error,
      });
      return NextResponse.json(
        { error: "Format de messages invalide" },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    const chatService = new ChatService(process.env.HF_TOKEN!);

    const lastUserMessage =
      messages.filter((m: { role: string }) => m.role === "user").pop()
        ?.content || "";

    logger.debug("Last user message extracted", {
      requestId,
      messageLength: lastUserMessage.length,
    });

    // Let the ChatService manage RAG and system prompt creation internally.
    const chatMessages = messages;
    logger.debug("Chat messages prepared", {
      requestId,
      totalMessages: chatMessages.length,
    });

    const response = await chatService.generateResponse(chatMessages);
    const images = chatService.extractImagesFromResponse(response);

    if (
      response ===
      "Je suis à court de token, une notification a été envoyé à Marco, le soucis seras corrigé d'ici peu."
    ) {
      const apiResponse: APIResponse = {
        response: response,
        metadata: {
          error: "token_expired",
          timestamp: new Date().toISOString(),
        },
      };

      logger.warn("Token expired response returned", {
        requestId,
      });

      return NextResponse.json(apiResponse, {
        headers: getCorsHeaders(),
      });
    }

    const functionCall = await chatService.parseResponseForFunctions(response);

    if (functionCall) {
      logger.info("Function call detected in response", {
        requestId,
        functionName: functionCall.name,
      });

      const functionResponse: FunctionResponse = {
        action: functionCall.name,
        params: functionCall.parameters,
      };

      const apiResponse: APIResponse = {
        response: functionResponse,
        metadata: {
          functionTriggered: functionCall.name,
          timestamp: new Date().toISOString(),
        },
      };

      logger.info("Function response returned", {
        requestId,
        functionName: functionCall.name,
      });

      return NextResponse.json(apiResponse, {
        headers: getCorsHeaders(),
      });
    }

    const cleanResponse = response
      .replace(/\[FUNCTION_CALL\].*?\[\/FUNCTION_CALL\]/gs, "")
      .replace(/\[IMAGE\][\s\S]*?\[\/IMAGE\]/gs, "")
      .trim();

    const apiResponse: APIResponse = {
      response: cleanResponse,
      metadata: {
        useRAG,
        knowledgeBaseSource: "RAG",
        timestamp: new Date().toISOString(),
      },
      images,
    };

    logger.info("Normal response returned", {
      requestId,
      responseLength: cleanResponse.length,
      useRAG,
    });

    return NextResponse.json(apiResponse, {
      headers: getCorsHeaders(),
    });
  } catch (error) {
    logger.error("Unhandled error in POST request", {
      requestId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse" },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}
