import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  return transporter;
};

export const verifyMailerConnection = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn(
      "Mailer | EMAIL_USER/EMAIL_APP_PASSWORD no configurados, se omite verificación SMTP",
    );
    return;
  }

  try {
    const mailer = getTransporter();
    await mailer.verify();
    console.log(
      "Mailer | Conexión SMTP verificada: smtp.gmail.com:465 cifrada con TLS ✅",
    );
  } catch (error) {
    console.error(
      "Mailer | No se pudo establecer conexión segura con el servidor SMTP:",
      error.message,
    );
  }
};

export const sendVerificationEmail = async ({ to, name, verificationUrl }) => {
  const mailer = getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>SmartAssets</h2>
      <p>Hola ${name},</p>
      <p>Gracias por registrarte. Para activar tu cuenta necesitamos confirmar que este es tu correo electrónico.</p>
      <p>
        <a href="${verificationUrl}"
           style="display:inline-block;padding:10px 20px;background:#0f766e;color:#fff;
                  text-decoration:none;border-radius:6px;">
          Verificar mi correo
        </a>
      </p>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p>Este enlace expira pronto. Si tú no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
    </div>
  `;

  const info = await mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Verifica tu correo - SmartAssets",
    html,
  });

  console.log(
    `Mailer | Correo de verificación enviado a ${to} vía TLS (id: ${info.messageId})`,
  );
};
