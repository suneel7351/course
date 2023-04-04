import { createTransport } from "nodemailer";

async function sendMail(email, subject, text) {
  const transport = createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const options = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  };
  await transport.sendMail(options);
}

export default sendMail;
