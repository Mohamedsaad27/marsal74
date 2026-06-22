import { usersApi } from "../admin/users.api";
import { getAccessToken } from "../auth/Auth.api";
import { BASE_URL } from "../utils";
// ─── Shared types ─────────────────────────────────────────────────────────────

export type ImportedUser = {
  row: number;
  name: string;
  email: string;
  generated_password: string;
};

export type ImportResult = {
  count: number;
  imported: ImportedUser[];
};

// NEW: background-job result (shipments import)
export type ImportBatchResult = {
  batch_id: string;
};

export type ImportPreviewColumn = {
  key: string;
  label: string;
};

export type ImportExcelConfig = {
  title: string;
  description: string;
  templateFilename: string;
  templateColumns: string[];
  templateSampleRow: string[];
  previewColumns: ImportPreviewColumn[];
  rowKey: string;
  importButtonLabel: string;
  /** Called when import finishes synchronously (users). */
  successMessage?: (count: number) => string;
  /** Called when import is dispatched to a background job (shipments). */
  batchSuccessMessage?: (batchId: string) => string;
  onDownloadTemplate?: () => Promise<void>;
  /** Returns synchronous ImportResult — users flow */
  onImport?: (file: File) => Promise<ImportResult>;
  /** Returns background ImportBatchResult — shipments flow */
  onImportBatch?: (file: File) => Promise<ImportBatchResult>;
};

// ─── Users config ─────────────────────────────────────────────────────────────

export const usersImportConfig: ImportExcelConfig = {
  title: "استيراد مستخدمين من Excel",
  description: "رفع ملف Excel أو CSV — متاح لمدير النظام (Super Admin) فقط.",
  templateFilename: "users-import-template.csv",
  templateColumns: ["name", "email", "phone", "gender", "is_active", "roles"],
  templateSampleRow: ["", "", "", "", "", ""],
  previewColumns: [
    { key: "name", label: "الاسم" },
    { key: "email", label: "البريد" },
    { key: "phone", label: "الهاتف" },
    { key: "gender", label: "الجنس" },
    { key: "is_active", label: "نشط" },
    { key: "roles", label: "الأدوار" },
  ],
  rowKey: "email",
  importButtonLabel: "استيراد المستخدمين",
  successMessage: (count) => `تم استيراد ${count} مستخدم بنجاح.`,

  onDownloadTemplate: () => usersApi.downloadImportTemplate(),

  onImport: async (file: File): Promise<ImportResult> => {
    const res = await usersApi.import(file);
    if (!res.isSuccess) throw new Error(res.message ?? "فشل الاستيراد");

    const data = res.data as {
      summary?: { imported_count?: number };
      imported?: ImportedUser[];
      errors?: unknown[];
    };

    return {
      count: data.summary?.imported_count ?? data.imported?.length ?? 0,
      imported: data.imported ?? [],
    };
  },
};

// ─── Shipments config ─────────────────────────────────────────────────────────

export const shipmentsImportConfig: ImportExcelConfig = {
  title: "استيراد طلبات من Excel",
  description: "رفع ملف الطلبات الواردة من شركة الشحن — جدول orders",
  templateFilename: "orders-import-template.csv",
  templateColumns: [
    "الكود",
    "اسم العميل",
    "العنوان",
    "المحافظة",
    "رقم التليفون",
    "وصف الشحنه",
    "عدد القطع",
    "الاجمالي",
    "اسم الشركة",
    "اسم الراسل",
    "اسم المندوب",
  ],
  templateSampleRow: ["", "", "", "", "", "", "", "", "", "", ""],
  previewColumns: [
    { key: "الكود", label: "الكود" },
    { key: "اسم العميل", label: "اسم العميل" },
    { key: "المحافظة", label: "المحافظة" },
    { key: "رقم التليفون", label: "الهاتف" },
    { key: "وصف الشحنه", label: "وصف الشحنة" },
    { key: "الاجمالي", label: "الإجمالي" },
    { key: "اسم المندوب", label: "المندوب" },
  ],
  rowKey: "الكود",
  importButtonLabel: "استيراد الطلبات",

  batchSuccessMessage: (batchId) => `جارٍ معالجة الملف في الخلفية `,

  onImportBatch: async (file: File): Promise<ImportBatchResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getAccessToken();
    const res = await fetch(`${BASE_URL}/admin/orders/import`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? `فشل الاستيراد (${res.status})`);
    }

    const json = (await res.json()) as {
      isSuccess: boolean;
      message?: string;
      data?: { batch_id?: string };
    };

    if (!json.isSuccess) throw new Error(json.message ?? "فشل الاستيراد");
    if (!json.data?.batch_id) throw new Error("لم يُعاد batch_id من الخادم");

    return { batch_id: json.data.batch_id };
  },
};
