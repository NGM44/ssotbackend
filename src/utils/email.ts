import sendGridMail from "@sendgrid/mail";
import logger from "./logger";

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY || "SG.FAKE");

export const emailTemplatesFolder = `${process.cwd()}/src/controller/template/emailTemplates/`;

export type SendEmailDto = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async (sendEmailDto: SendEmailDto) => {
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
