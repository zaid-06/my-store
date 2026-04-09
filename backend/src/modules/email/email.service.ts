import * as templates from "./email.templates";



import { logger } from  "../../shared/logger";

export const sendEmail = async (
  to: string,
  template: keyof typeof templates,
  data: Record<string, any>
) => {
  try {
    const templateFn = templates[template];

    if (!templateFn) {
      throw new Error(`Invalid email template: ${template}`);
    }

    const { subject, body } = templateFn(data);

    // 
    logger.info("Sending email", {
      to,
      subject,
    });

    // (optional) avoid logging full body in prod
    logger.debug("Email content", {
      body,
    });

    return Promise.resolve();

  } catch (error) {
    // 
    logger.error("Email sending failed", {
      error,
      to,
      template,
    });

    throw error; // keep this
  }
};