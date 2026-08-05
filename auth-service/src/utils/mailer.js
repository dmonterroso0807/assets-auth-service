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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff; padding: 40px 10px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(109, 40, 217, 0.08); border: 1px solid #ede9fe;">
      
        <!-- Header con gradiente violeta -->
        <div style="background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">SmartAssets</h1>
        </div>

        <!-- Cuerpo del mensaje -->
        <div style="padding: 32px 28px; color: #334155;">
          <h3 style="color: #1e1b4b; font-size: 20px; margin-top: 0; margin-bottom: 12px; font-weight: 600;">¡Hola, ${name}! 👋</h3>
        
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
            Gracias por registrarte en SmartAssets. Para activar tu cuenta y asegurar tus datos, confirma tu dirección de correo electrónico.
          </p>

          <!-- Botón principal CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}"
              style="display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
              Verificar mi correo
            </a>
          </div>

         <!-- Bloque de enlace secundario -->
          <div style="background-color: #f8f5ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="font-size: 13px; color: #6b21a8; margin: 0 0 8px 0; font-weight: 600;">¿El botón no funciona?</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">Copia y pega este enlace en tu navegador:</p>
            <a href="${verificationUrl}" style="font-size: 12px; color: #7c3aed; word-break: break-all; text-decoration: underline;">${verificationUrl}</a>
          </div>

          <!-- Pie/Aviso -->
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; margin-bottom: 0;">
            Este enlace expira pronto. Si no creaste una cuenta en SmartAssets, puedes ignorar este mensaje.
          </p>
        </div>

      </div>
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
