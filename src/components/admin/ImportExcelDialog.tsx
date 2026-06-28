import { useRef, useState, useEffect } from "react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ImportExcelConfig, ImportedUser } from "@/lib/admin/import-excel-configs";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck2,
  Copy,
  Check,
  ClockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ImportExcelConfig;
  onImportComplete?: (count: number) => void;
};

export function ImportExcelDialog({ open, onOpenChange, config, onImportComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileReady, setFileReady] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [importedUsers, setImportedUsers] = useState<ImportedUser[]>([]);
  const [importCount, setImportCount] = useState(0);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // ── reset ──────────────────────────────────────────────────────────────────

  const reset = () => {
    setFileName(null);
    setFileReady(false);
    setValidationError(null);
    setImporting(false);
    setSuccess(false);
    setImportedUsers([]);
    setImportCount(0);
    setBatchId(null);
    setCopiedEmail(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  // ── file selection ─────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSuccess(false);
    setValidationError(null);
    setFileReady(false);
    setImportedUsers([]);
    setImportCount(0);
    setBatchId(null);

    if (!file) {
      setFileName(null);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      setFileName(file.name);
      setValidationError("صيغة غير مدعومة. استخدم ملف Excel (.xlsx, .xls) أو CSV.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileName(file.name);
      setValidationError("حجم الملف يتجاوز 10 ميجابايت.");
      return;
    }

    setFileName(file.name);
    setFileReady(true);
  };

  // ── download template ──────────────────────────────────────────────────────

  const handleDownloadTemplate = async () => {
    if (config.onDownloadTemplate) {
      await config.onDownloadTemplate();
      return;
    }
    // local CSV fallback
    const header = config.templateColumns.join(",");
    const sample = config.templateSampleRow.join(",");
    const blob = new Blob(["\uFEFF" + header + "\n" + sample], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = config.templateFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── import ─────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file || !fileReady) return;

    setImporting(true);
    try {
      // ── Batch / background flow (e.g. shipments) ───────────────────────────
      if (config.onImportBatch) {
        const result = await config.onImportBatch(file);
        setBatchId(result.batch_id);
        toast.success(config.batchSuccessMessage?.(result.batch_id) ?? "تم الإرسال بنجاح");
        setSuccess(true);
        onImportComplete?.(0); // count unknown at dispatch time
        return;
      }

      // ── Synchronous flow (e.g. users) ──────────────────────────────────────
      if (config.onImport) {
        const result = await config.onImport(file);
        setImportedUsers(result.imported);
        setImportCount(result.count);
        setSuccess(true);
        onImportComplete?.(result.count);
        return;
      }

      setValidationError("لم يتم ربط API الاستيراد بعد لهذا النوع.");
    } catch (err) {
      setValidationError((err as Error).message ?? "فشل الاستيراد");
    } finally {
      setImporting(false);
    }
  };

  // ── copy password helper ───────────────────────────────────────────────────

  const copyPassword = async (email: string, password: string) => {
    await navigator.clipboard.writeText(password);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // ── step indicator ─────────────────────────────────────────────────────────

  const step = success ? 3 : fileReady ? 2 : 1;

  // ── render ─────────────────────────────────────────────────────────────────
  // Add this effect inside ImportExcelDialog, after the existing state declarations:
  useEffect(() => {
    if (!success || !batchId) return;

    const timer = setTimeout(() => {
      onImportComplete?.(0); // triggers reload in parent
      handleOpenChange(false); // closes the dialog
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, batchId]);
  return (
    <AdminDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title={config.title}
      description={config.description}
      icon={FileSpreadsheet}
      tone="import"
      badge="استيراد"
      size="xl"
      footer={
        <>
          <Button
            className="rounded-xl gradient-brand px-6 shadow-glow"
            disabled={!fileReady || !!validationError || importing || success}
            onClick={handleImport}
          >
            {importing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            {config.importButtonLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-5"
            onClick={() => handleOpenChange(false)}
          >
            إغلاق
          </Button>
        </>
      }
    >
      {/* ── Step indicator ── */}
      <div className="mb-5 flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft">
        {[
          { n: 1, label: "القالب" },
          { n: 2, label: "الرفع" },
          { n: 3, label: "الاستيراد" },
        ].map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                step >= s.n
                  ? "gradient-brand text-white shadow-glow"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </span>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:inline",
                step >= s.n ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {i < 2 && (
              <div className={cn("mx-1 h-px flex-1", step > s.n ? "bg-primary/40" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* ── Download template ── */}
      <Button
        type="button"
        variant="outline"
        className="mb-4 w-full rounded-xl border-dashed sm:w-auto"
        onClick={handleDownloadTemplate}
      >
        <Download className="ms-2 h-4 w-4" />
        تحميل قالب Excel
      </Button>

      {/* ── Drop zone ── */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border-2 border-dashed border-border/80 bg-card p-8 text-center transition-all",
          fileReady && "border-primary/50 bg-primary/5 shadow-glow",
          !fileReady && "hover:border-primary/30 hover:bg-muted/30",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted group-hover:bg-primary/10">
          <Upload className="h-7 w-7 text-muted-foreground group-hover:text-primary" />
        </div>
        <p className="text-sm font-semibold">اسحب الملف هنا أو اختر من جهازك</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4 rounded-xl"
          onClick={() => inputRef.current?.click()}
        >
          اختيار ملف
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          .xlsx · .xls · .csv — بحد أقصى 10 ميجابايت
        </p>
        {fileName && fileReady && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <FileCheck2 className="h-4 w-4" />
            {fileName}
          </p>
        )}
      </div>

      {/* ── Validation error ── */}
      {validationError && (
        <Alert variant="destructive" className="mt-4 rounded-xl border-destructive/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* ── Batch / background success (shipments) ── */}
      {success && batchId && config.batchSuccessMessage && (
        <Alert className="mt-4 rounded-xl border-success/40 bg-success/10 text-success">
          <ClockIcon className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {config.batchSuccessMessage(batchId)}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Synchronous success alert (users) ── */}
      {success && !batchId && config.successMessage && (
        <Alert className="mt-4 rounded-xl border-success/40 bg-success/10 text-success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {config.successMessage(importCount)}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Generated passwords table (users only) ── */}
      {success && !batchId && importedUsers.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              كلمات المرور المُوّلدة
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary tabular-nums">
              {importedUsers.length} مستخدم
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-right text-xs font-semibold text-muted-foreground">
                  <th className="px-4 py-3 whitespace-nowrap">الاسم</th>
                  <th className="px-4 py-3 whitespace-nowrap">البريد الإلكتروني</th>
                  <th className="px-4 py-3 whitespace-nowrap">كلمة المرور</th>
                  <th className="px-4 py-3 whitespace-nowrap" />
                </tr>
              </thead>
              <tbody>
                {importedUsers.map((u) => (
                  <tr
                    key={u.email}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{u.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="rounded-lg bg-muted px-2.5 py-1 font-mono text-xs font-semibold tracking-wide select-all">
                        {u.generated_password}
                      </code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => copyPassword(u.email, u.generated_password)}
                        title="نسخ كلمة المرور"
                      >
                        {copiedEmail === u.email ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-border/50 px-4 py-3 text-xs text-muted-foreground">
            احتفظ بكلمات المرور هذه وأرسلها للمستخدمين — لن تظهر مرة أخرى.
          </p>
        </div>
      )}
    </AdminDialogShell>
  );
}
