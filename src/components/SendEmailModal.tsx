import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Paperclip, 
  Check, 
  Eye, 
  Download, 
  Trash2, 
  FileText, 
  AlertCircle,
  Building,
  ArrowRight,
  Sparkles,
  Inbox,
  RotateCw
} from 'lucide-react';
import { TouchButton } from './TouchButton';
import { 
  EmailSubmissionData, 
  EmailAttachment, 
  generateSubmissionEmailHtml, 
  formatFileSize 
} from '../utils/emailTemplate';
import { downloadAttachedFile, prepareAttachmentsForResend } from '../utils/fileDownloader';
import { isValidEmail, validateEmailList } from '../utils/validation';
import { useProjectContext } from '../context/ProjectContext';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultData: {
    requestType: 'BAST' | 'Invoice' | 'RFS' | 'Penagihan' | 'Both';
    woNumber: string;
    projectName: string;
    vendorName?: string;
    defaultRecipient?: string;
    defaultRecipientName?: string;
    availableAttachments: EmailAttachment[];
  };
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  defaultData
}) => {
  const { showToast } = useProjectContext();

  // Mode: 'form' (Form Pengiriman) or 'preview' (Tampilan Penerima / Gmail Preview)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Sending status
  const [isSending, setIsSending] = useState(false);
  const [sendingStatusText, setSendingStatusText] = useState('');

  // Form states
  const [recipientEmail, setRecipientEmail] = useState(defaultData.defaultRecipient || 'sap.procurement@telkom.co.id');
  const [recipientName, setRecipientName] = useState(defaultData.defaultRecipientName || 'Bpk. Aris Munandar / Tim SAP Asset');
  
  // Multi-Cc list & current text
  const [ccList, setCcList] = useState<string[]>([
    'project.control@belacom.co.id',
    'gov.jabo.review@telkom.co.id'
  ]);
  const [ccInput, setCcInput] = useState('');

  // Subject
  const [subject, setSubject] = useState(
    `[PENGAJUAN SAP] ${defaultData.requestType} - ${defaultData.woNumber} - ${defaultData.projectName}`
  );

  // User notes
  const [userNotes, setUserNotes] = useState(
    'Berikut kami lampirkan dokumen lengkap yang telah terverifikasi untuk diproses lebih lanjut ke SAP.'
  );

  // Selected attachments checklist
  const [selectedAttachments, setSelectedAttachments] = useState<EmailAttachment[]>(
    defaultData.availableAttachments
  );

  // Update defaults when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setRecipientEmail(defaultData.defaultRecipient || 'sap.procurement@telkom.co.id');
      setRecipientName(defaultData.defaultRecipientName || 'Bpk. Aris Munandar / Tim SAP Asset');
      setSubject(`[PENGAJUAN SAP] ${defaultData.requestType} - ${defaultData.woNumber} - ${defaultData.projectName}`);
      setSelectedAttachments(defaultData.availableAttachments);
      setIsSending(false);
      setSendingStatusText('');
    }
  }, [isOpen, defaultData]);

  // Pasang window helper untuk menangkap klik unduh dari preview HTML
  useEffect(() => {
    (window as unknown as { __belacomDownload: (name: string, url?: string) => void }).__belacomDownload = (name: string, url?: string) => {
      downloadAttachedFile(name, url);
      showToast('info', 'Mengunduh Berkas', `File ${name} sedang diunduh...`);
    };

    return () => {
      delete (window as unknown as { __belacomDownload?: unknown }).__belacomDownload;
    };
  }, [showToast]);

  if (!isOpen) return null;

  // Handler Multi-Cc dengan validasi RFC 5322
  const handleAddCc = () => {
    const trimmed = ccInput.trim().replace(/,/g, '');
    if (!trimmed) return;
    if (ccList.includes(trimmed)) {
      setCcInput('');
      return;
    }
    // Validasi ketat format email menggunakan regex standar RFC 5322
    if (!isValidEmail(trimmed)) {
      showToast('error', 'Format Email Tidak Valid', `Email '${trimmed}' tidak memenuhi format standar RFC 5322 (contoh: user@domain.com).`);
      return;
    }
    setCcList(prev => [...prev, trimmed]);
    setCcInput('');
  };

  const handleCcKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddCc();
    }
  };

  const handleRemoveCc = (emailToRemove: string) => {
    if (isSending) return;
    setCcList(prev => prev.filter(e => e !== emailToRemove));
  };

  // Toggle attachment checkbox
  const handleToggleAttachment = (attachment: EmailAttachment) => {
    if (isSending) return;
    setSelectedAttachments(prev => {
      const exists = prev.some(a => a.name === attachment.name);
      if (exists) {
        return prev.filter(a => a.name !== attachment.name);
      } else {
        return [...prev, attachment];
      }
    });
  };

  const emailData: EmailSubmissionData = {
    recipientName,
    recipientEmail,
    ccEmails: ccList,
    subject,
    projectName: defaultData.projectName,
    woNumber: defaultData.woNumber,
    vendorName: defaultData.vendorName || 'PT. BELACOM / PT. MANDAU',
    requestType: defaultData.requestType,
    userNotes,
    attachments: selectedAttachments,
    submissionDate: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  };

  const generatedHtml = generateSubmissionEmailHtml(emailData);

  // Send Email Handler Nyata ke endpoint /api/send-email
  const handleSendEmail = async () => {
    if (isSending) return;

    // 1. Validasi penerima utama (To) dengan standar RFC 5322
    const cleanTo = recipientEmail.trim();
    if (!cleanTo || !isValidEmail(cleanTo)) {
      showToast('error', 'Email Penerima Wajib Valid', 'Harap isi alamat email penerima utama yang valid sesuai standar RFC 5322.');
      return;
    }

    // 2. Validasi setiap item dalam daftar Multi-Cc
    const { valid: validCc, invalid: invalidCc } = validateEmailList(ccList);
    if (invalidCc.length > 0) {
      showToast('error', 'Daftar Cc Tidak Valid', `Alamat email Cc berikut tidak valid: ${invalidCc.join(', ')}`);
      return;
    }

    setIsSending(true);
    setSendingStatusText('Mengonversi dokumen PDF ke format Base64...');

    try {
      // 3. Konversi seluruh dokumen lampiran ke format Base64 lengkap
      const preparedAttachments = await prepareAttachmentsForResend(selectedAttachments);

      setSendingStatusText('Mengirim email via Resend API ke server...');

      // 4. Lakukan HTTP POST ke endpoint serverless /api/send-email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: [cleanTo],
          cc: validCc.length > 0 ? validCc : undefined,
          subject: subject.trim(),
          html: generatedHtml,
          attachments: preparedAttachments
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Server merespon dengan status ${response.status}`);
      }

      // 5. Simpan ke riwayat LocalStorage
      try {
        const historyKey = 'belacom_sent_emails';
        const existing = localStorage.getItem(historyKey);
        const parsed = existing ? JSON.parse(existing) : [];
        const newEntry = {
          id: result.id || ('EMAIL-' + Math.random().toString(36).substring(2, 9)),
          sentAt: new Date().toISOString(),
          deliveryStatus: 'TERKIRIM',
          resendMessageId: result.id,
          simulated: result.simulated,
          ...emailData,
          ccEmails: validCc,
          attachmentsCount: preparedAttachments.length
        };
        localStorage.setItem(historyKey, JSON.stringify([newEntry, ...parsed].slice(0, 50)));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      // 6. Notifikasi sukses sesuai spesifikasi
      showToast(
        'success',
        'Email Berhasil Dikirim!',
        'Email dan lampiran berhasil dikirim ke penerima & Cc!'
      );

      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[SendEmailModal] Gagal mengirim:', error);
      showToast(
        'error',
        'Gagal Mengirim Email',
        error.message || 'Terjadi gangguan saat menghubungkan ke server pengiriman email.'
      );
    } finally {
      setIsSending(false);
      setSendingStatusText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-5xl w-full max-h-[94vh] h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Kirim Email Resmi & Dokumen SAP
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {defaultData.requestType}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                No. WO: <span className="text-cyan-400 font-bold">{defaultData.woNumber}</span> · {defaultData.projectName}
              </p>
            </div>
          </div>

          {/* Tab Switcher: Form vs Gmail Preview */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Form Pengiriman</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Tampilan Penerima (Gmail)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Tutup (X)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6">
          
          {/* TAB 1: FORM PENGIRIMAN */}
          {activeTab === 'form' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              
              {/* Penerima Utama & Nama */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Penerima Utama (To) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="contoh: sap.procurement@telkom.co.id"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-white rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nama Penerima / Unit
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Bpk. Aris Munandar / Tim SAP Asset"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-white rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              {/* Multi-Cc Input Field */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Tembusan Email (Multi-Cc)</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Tekan Enter atau koma (,) untuk menambahkan email
                  </span>
                </label>

                {/* Chips of added Cc emails */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-1 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                  {ccList.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md text-[11px] font-mono"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCc(email)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Hapus Cc"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  <input
                    type="email"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={handleCcKeyDown}
                    placeholder={ccList.length === 0 ? "Ketik email Cc lalu tekan Enter..." : "Tambah Cc..."}
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none min-w-[160px] px-2 py-0.5 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Total {ccList.length} alamat Cc terdaftar</span>
                  {ccInput && (
                    <button
                      type="button"
                      onClick={handleAddCc}
                      className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      + Tambah Email
                    </button>
                  )}
                </div>
              </div>

              {/* Subjek Email */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Subjek Email Resmi
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-white rounded-xl p-2.5 outline-none font-mono font-semibold"
                />
              </div>

              {/* User Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Catatan Pengguna (USER NOTES)
                </label>
                <textarea
                  rows={3}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Masukkan catatan khusus, arahan revisi, atau detail pengajuan SAP..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-slate-200 rounded-xl p-3 outline-none"
                />
              </div>

              {/* Checklist Berkas Terlampir */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyan-400 uppercase font-mono flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    Pilih Berkas Lampiran yang Disertakan ({selectedAttachments.length} Dipilih)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAttachments.length === defaultData.availableAttachments.length) {
                        setSelectedAttachments([]);
                      } else {
                        setSelectedAttachments(defaultData.availableAttachments);
                      }
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-mono cursor-pointer"
                  >
                    {selectedAttachments.length === defaultData.availableAttachments.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </div>

                {defaultData.availableAttachments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada dokumen PDF terunggah pada data ini.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {defaultData.availableAttachments.map((att) => {
                      const isChecked = selectedAttachments.some(a => a.name === att.name);
                      return (
                        <div
                          key={att.name}
                          onClick={() => handleToggleAttachment(att)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-blue-950/40 border-blue-500/40 text-white'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                              isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-900'
                            }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-xs font-mono truncate" title={att.name}>{att.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-500 font-mono">{formatFileSize(att.sizeBytes)}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadAttachedFile(att.name, att.url);
                                showToast('info', 'Mengunduh Berkas', `File ${att.name} sedang diunduh...`);
                              }}
                              className="p-1 hover:text-cyan-400 text-slate-400 cursor-pointer"
                              title="Unduh Berkas Langsung"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: TAMPILAN PENERIMA (GMAIL SIMULATION PREVIEW) */}
          {activeTab === 'preview' && (
            <div className="max-w-4xl mx-auto space-y-4">
              
              {/* Gmail Mock Client Header Frame */}
              <div className="bg-[#f6f8fc] border border-slate-300 rounded-xl overflow-hidden shadow-xl text-slate-800">
                
                {/* Gmail Top Bar */}
                <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      M
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Gmail Client Preview</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">Inbox</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Simulasi tampilan persis yang akan diterima oleh klien di Gmail
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Email Metadata Envelope Header */}
                <div className="p-5 bg-white border-b border-slate-200 space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {subject}
                  </h2>

                  <div className="flex items-start justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        B
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          PT. BELACOM INDONESIA TELECOM <span className="text-slate-500 font-normal text-[11px]">&lt;project.control@belacom.co.id&gt;</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          to: <strong className="text-slate-700">{recipientEmail}</strong>
                          {ccList.length > 0 && (
                            <span className="ml-1 text-slate-500">
                              · cc: {ccList.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono shrink-0">
                      Standard TLS Security
                    </div>
                  </div>
                </div>

                {/* Rendered HTML Email Content with active download triggers */}
                <div className="p-4 sm:p-6 bg-[#f1f5f9] overflow-x-auto flex justify-center">
                  <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  />
                </div>

                {/* Quick Interactive Download Strip */}
                {selectedAttachments.length > 0 && (
                  <div className="p-4 bg-white border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5 font-mono">
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      Uji Unduh Berkas Lampiran ({selectedAttachments.length} Dokumen):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAttachments.map((att) => (
                        <button
                          key={att.name}
                          type="button"
                          onClick={() => {
                            downloadAttachedFile(att.name, att.url);
                            showToast('success', 'Mengunduh Berkas', `${att.name} berhasil diunduh ke komputer.`);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>{att.name}</span>
                          <span className="text-[10px] text-slate-400">({formatFileSize(att.sizeBytes)})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            {isSending ? (
              <div className="flex items-center gap-2 text-cyan-400 font-semibold animate-pulse">
                <RotateCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                <span>{sendingStatusText || 'Sedang memproses transmisi...'}</span>
              </div>
            ) : (
              <>
                <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="hidden sm:inline">Citratel / Belacom Gov Jabo Submission System</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <TouchButton 
              variant="secondary" 
              size="md" 
              onClick={onClose}
              disabled={isSending}
            >
              Tutup
            </TouchButton>

            <TouchButton
              variant="primary"
              size="md"
              icon={isSending ? <RotateCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              onClick={handleSendEmail}
              disabled={isSending}
              showFingerIcon={!isSending}
              className={`font-bold transition-all ${
                isSending 
                  ? 'bg-blue-800 text-slate-200 cursor-not-allowed opacity-80' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
              }`}
            >
              {isSending ? 'Mengirim...' : 'Kirim Email Resmi'}
            </TouchButton>
          </div>
        </div>

      </div>
    </div>
  );
};
