type PanelAccessEmailInput = {
  brandName: string;
  panelUrl: string;
  email: string;
  temporaryPassword: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderPanelAccessEmail(input: PanelAccessEmailInput) {
  const brand = input.brandName;
  const panelUrl = input.panelUrl;
  const email = input.email;
  const tempPassword = input.temporaryPassword;

  const subject = `${brand} — Acceso al Panel`;

  const text = [
    `${brand} — Acceso al Panel`,
    "",
    "Tu cuenta del panel (Pterodactyl) ha sido creada.",
    "",
    `Panel: ${panelUrl}`,
    `Email: ${email}`,
    `Contraseña temporal: ${tempPassword}`,
    "",
    "Importante: inicia sesión y cambia la contraseña lo antes posible.",
  ].join("\n");

  const safeBrand = escapeHtml(brand);
  const safePanelUrl = escapeHtml(panelUrl);
  const safeEmail = escapeHtml(email);
  const safeTempPassword = escapeHtml(tempPassword);

  const html = `
  <div style="margin:0;padding:0;background:#0b1220;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#0b1220;">
      <tr>
        <td style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:600px;margin:0 auto;">
            <tr>
              <td style="padding:0 0 16px 0;color:#e5e7eb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
                <div style="font-weight:800;font-size:20px;letter-spacing:-0.02em;">${safeBrand}</div>
                <div style="color:#9ca3af;font-size:13px;margin-top:6px;">Acceso al panel de control</div>
              </td>
            </tr>

            <tr>
              <td style="background:#0f172a;border:1px solid #1f2937;border-radius:16px;padding:20px 20px 18px 20px;">
                <div style="color:#e5e7eb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
                  <div style="font-size:16px;font-weight:700;margin:0 0 10px 0;">Tu cuenta del panel está lista</div>
                  <div style="font-size:13px;line-height:1.6;color:#cbd5e1;margin:0 0 14px 0;">
                    Ya puedes entrar al panel para gestionar tu servidor: consola, archivos, backups y más.
                  </div>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:12px 0 14px 0;">
                    <tr>
                      <td style="padding:10px 12px;background:#0b1220;border:1px solid #1f2937;border-radius:12px;">
                        <div style="font-size:12px;color:#9ca3af;">Panel</div>
                        <div style="font-size:13px;font-weight:600;color:#e5e7eb;word-break:break-all;">${safePanelUrl}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px;background:#0b1220;border:1px solid #1f2937;border-radius:12px;">
                        <div style="font-size:12px;color:#9ca3af;">Email</div>
                        <div style="font-size:13px;font-weight:600;color:#e5e7eb;">${safeEmail}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px;background:#0b1220;border:1px solid #1f2937;border-radius:12px;">
                        <div style="font-size:12px;color:#9ca3af;">Contraseña temporal</div>
                        <div style="font-size:13px;font-weight:700;color:#e5e7eb;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${safeTempPassword}</div>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 14px 0;">
                    <tr>
                      <td style="background:#22c55e;border-radius:12px;">
                        <a href="${safePanelUrl}" style="display:inline-block;padding:10px 14px;color:#052e16;text-decoration:none;font-weight:800;font-size:13px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">Abrir panel</a>
                      </td>
                    </tr>
                  </table>

                  <div style="font-size:12px;line-height:1.6;color:#9ca3af;">
                    Por seguridad, cambia la contraseña tras el primer inicio de sesión.
                    Si no has solicitado este acceso, ignora este email.
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 4px 0 4px;color:#6b7280;font-size:11px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
                © ${new Date().getFullYear()} ${safeBrand}. Todos los derechos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  return { subject, text, html };
}
