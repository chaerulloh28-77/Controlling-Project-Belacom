export interface EmailAttachment {
  name: string;
  url?: string;
  sizeBytes?: number;
  base64?: string;
}

export interface EmailSubmissionData {
  recipientName: string;
  recipientEmail: string;
  ccEmails: string[];
  subject: string;
  projectName: string;
  woNumber: string;
  vendorName: string;
  requestType: 'BAST' | 'Invoice' | 'RFS' | 'Penagihan' | 'Both';
  userNotes: string;
  attachments: EmailAttachment[];
  submissionDate: string;
}

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '1.2 MB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Merender struktur HTML email tabel responsif berstandar email client (Gmail / Outlook)
 */
export const generateSubmissionEmailHtml = (data: EmailSubmissionData): string => {
  const attachmentLinks = data.attachments.length > 0
    ? data.attachments.map((att, idx) => {
        const downloadHref = att.base64
          ? `data:application/pdf;base64,${att.base64}`
          : (att.url && att.url !== '#' ? att.url : '#');

        return `
        <li style="margin-bottom: 8px; color: #1e293b; font-size: 13px;">
          <span style="font-weight: 600; color: #64748b;">${idx + 1}.</span> 
          <a href="${downloadHref}" 
             download="${att.name}"
             data-download="true"
             data-filename="${att.name}" 
             data-fileurl="${att.url || '#'}" 
             style="color: #0284c7; text-decoration: underline; font-weight: 600; font-family: monospace;"
             onclick="if(window.__belacomDownload) { window.__belacomDownload('${att.name}', '${att.url || ''}'); } return true;">
            ${att.name}
          </a> 
          <span style="color: #94a3b8; font-size: 11px; font-family: monospace;">(${formatFileSize(att.sizeBytes)})</span>
        </li>
      `;
      }).join('')
    : '<li style="color: #94a3b8; font-size: 12px; font-style: italic;">Tidak ada berkas terlampir.</li>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 650px; margin: 24px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
    
    <!-- Banner Biru Atas (#1E56A0) -->
    <div style="background-color: #1E56A0; padding: 28px 32px; color: #ffffff; text-align: left;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <div style="font-size: 22px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; margin-bottom: 4px;">
              CITRATEL <span style="font-weight: 300; opacity: 0.85;">|</span> CONTROLLING PROJECT BELACOM
            </div>
            <div style="font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #93c5fd;">
              GOV JABO DASHBOARD SUBMISSION
            </div>
          </td>
          <td align="right" style="vertical-align: middle;">
            <div style="background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 6px 12px; font-size: 11px; font-family: monospace; color: #ffffff;">
              ${data.submissionDate}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Konten Utama -->
    <div style="padding: 32px 32px 24px 32px; color: #1e293b;">
      
      <!-- Sapaan Pembuka -->
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 20px; color: #0f172a;">
        Dear <strong>${data.recipientName || 'Bapak/Ibu Tim Terkait'}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
        Mohon kiranya dibantu untuk mereview Dokumen Terlampir untuk diajukan ke SAP, berikut Rinciannya :
      </p>

      <!-- Kotak Rincian Proyek -->
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px; color: #1e293b;">
          <tr>
            <td width="28%" style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; font-family: monospace;">PROJECT</td>
            <td width="4%" style="color: #94a3b8;">:</td>
            <td width="68%" style="font-weight: 700; color: #0f172a;">${data.projectName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; font-family: monospace;">ID</td>
            <td style="color: #94a3b8;">:</td>
            <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${data.woNumber}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; font-family: monospace;">VENDOR</td>
            <td style="color: #94a3b8;">:</td>
            <td style="font-weight: 600; color: #334155;">${data.vendorName || 'PT. BELACOM / PT. MANDAU'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; font-family: monospace;">REQUEST TYPE</td>
            <td style="color: #94a3b8;">:</td>
            <td>
              <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; text-transform: uppercase; font-family: monospace;">
                ${data.requestType}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Kotak Catatan Pengguna (USER NOTES) -->
      ${data.userNotes ? `
        <div style="background-color: #fefce8; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 0.5px; margin-bottom: 6px; font-family: monospace;">
            USER NOTES:
          </div>
          <div style="font-size: 13px; color: #78350f; font-style: italic; line-height: 1.5;">
            "${data.userNotes}"
          </div>
        </div>
      ` : ''}

      <!-- Daftar Lampiran Berkas (ATTACHED DOCUMENTS) -->
      <div style="margin-bottom: 28px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.8px; margin-bottom: 12px; font-family: monospace; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          ATTACHED DOCUMENTS (${data.attachments.length} Berkas):
        </div>
        <ul style="padding-left: 18px; margin: 0; list-style-type: none;">
          ${attachmentLinks}
        </ul>
        <div style="margin-top: 10px; font-size: 11px; color: #64748b; font-style: italic;">
          * Klik pada nama berkas di atas untuk mengunduh dokumen secara langsung ke perangkat Anda.
        </div>
      </div>

      <!-- Tombol CTA -->
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="#dashboard" 
           style="display: inline-block; background-color: #1E56A0; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 10px rgba(30, 86, 160, 0.3);">
          Buka Dashboard & Review
        </a>
      </div>

    </div>

    <!-- Footer Sistem -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.5;">
      <div>&copy; 2026 GOV JABO - Dashboard System.</div>
      <div>This is an automated message sent via Gov Jabo Dashboard System.</div>
    </div>

  </div>
</body>
</html>
  `.trim();
};
