import * as templates from "./email.templates";



export const sendEmail = async (
  to: string,
  template: keyof typeof templates,
  data: Record<string, any>
) => {
  try {
    // get template function
    const templateFn = templates[template];

    if (!templateFn) {
      throw new Error(`Invalid email template: ${template}`);
    }

    // generate content
    const { subject, body } = templateFn(data);

    

    console.log("📧 Sending Email:");
    console.log({
      to,
      subject,
      body,
    });

    // simulate async behavior
    return Promise.resolve();

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error; // important → job retry depends on this
  }
};