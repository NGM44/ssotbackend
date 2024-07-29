import sendGridMail from "@sendgrid/mail";
import logger from "./logger";

export const emailTemplatesFolder = `${process.cwd()}/src/controllers/templates/emailTemplates`;

export type SendEmailDto = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async (sendEmailDto: SendEmailDto) => {
  const apiKey = process.env.SENDGRID_API_KEY!;
  sendGridMail.setApiKey(apiKey);
  const { from, to, subject, html } = sendEmailDto;
  logger.info(`Sending Email from ${from} to ${to} `);
  try {
    const res = await sendGridMail.send({
      to,
      from,
      subject,
      html,
    });
    return res;
  } catch (err) {
    logger.error(err);
    return err;
  }
};
