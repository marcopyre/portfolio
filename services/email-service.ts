import { Resend } from "resend";
import { logger } from "@/utils/logger";

export class EmailService {
  private resend: Resend | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      logger.warn(
        "RESEND_API_KEY is not configured - email notifications will be disabled"
      );
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
      logger.info("EmailService initialized with Resend");
    }
  }

  async sendTokenExpiredNotification(): Promise<void> {
    if (!this.resend) {
      logger.warn("Resend not configured, skipping token expired notification");
      return;
    }
    try {
      const result = await this.resend.emails.send({
        from: "Portfolio Bot <noreply-portfolio@resend.dev>",
        to: ["ytmarcopyre@gmail.com"],
        subject: "🚨 Crédits Hugging Face épuisés - Portfolio Bot",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🚨 Alerte Crédits Hugging Face</h2>
            <p>Bonjour Marco,</p>
            <p>Les crédits Hugging Face de votre portfolio bot sont épuisés.</p>
            <p><strong>Action requise :</strong> Rechargez vos crédits sur Hugging Face pour rétablir le service.</p>
            <p>Le bot affiche actuellement le message suivant aux utilisateurs :</p>
            <blockquote style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              "Je suis à court de token, une notification a été envoyé à Marco, le soucis seras corrigé d'ici peu."
            </blockquote>
            <p>Merci de corriger ce problème dès que possible.</p>
            <p>Cordialement,<br>Votre Portfolio Bot</p>
          </div>
        `,
      });
      logger.info("Token expired notification sent successfully", {
        emailId: result.data?.id,
      });
    } catch (error) {
      logger.error("Failed to send token expired notification", error);
      throw error;
    }
  }

  async sendConversationLog(
    userMessage: string,
    botResponse: string,
    timestamp: string
  ): Promise<void> {
    if (!this.resend) {
      logger.warn("Resend not configured, skipping conversation log");
      return;
    }
    try {
      const result = await this.resend.emails.send({
        from: "Portfolio Bot <noreply-portfolio@resend.dev>",
        to: ["ytmarcopyre@gmail.com"],
        subject: "💬 Nouvelle conversation - Portfolio Bot",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">💬 Nouvelle conversation</h2>
            <p><strong>Date :</strong> ${timestamp}</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">👤 Message utilisateur :</h3>
              <p style="margin: 0; white-space: pre-wrap;">${userMessage}</p>
            </div>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">🤖 Réponse du bot :</h3>
              <p style="margin: 0; white-space: pre-wrap;">${botResponse}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Cette conversation a été automatiquement enregistrée par votre portfolio bot.
            </p>
          </div>
        `,
      });
      logger.info("Conversation log sent successfully", {
        emailId: result.data?.id,
        timestamp,
      });
    } catch (error) {
      logger.error("Failed to send conversation log", error);
    }
  }

  async sendErrorNotification(error: Error, context: string): Promise<void> {
    if (!this.resend) {
      logger.warn("Resend not configured, skipping error notification");
      return;
    }
    try {
      const result = await this.resend.emails.send({
        from: "Portfolio Bot <noreply-portfolio@resend.dev>",
        to: ["ytmarcopyre@gmail.com"],
        subject: "⚠️ Erreur Portfolio Bot",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">⚠️ Erreur détectée</h2>
            <p><strong>Contexte :</strong> ${context}</p>
            <p><strong>Erreur :</strong> ${error.message}</p>
            <p><strong>Stack trace :</strong></p>
            <pre style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px;">${error.stack}</pre>
            <p>Merci de vérifier et corriger ce problème.</p>
          </div>
        `,
      });
      logger.info("Error notification sent successfully", {
        emailId: result.data?.id,
        context,
      });
    } catch (emailError) {
      logger.error("Failed to send error notification", emailError);
    }
  }
}
