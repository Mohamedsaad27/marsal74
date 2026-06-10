import { usersApi } from "../admin/users.api";

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
  successMessage: (count: number) => string;
  onDownloadTemplate?: () => Promise<void>;
  onImport?: (file: File) => Promise<ImportResult>;
};

// ─── Users config ─────────────────────────────────────────────────────────────

export const usersImportConfig: ImportExcelConfig = {
  title: "استيراد مستخدمين من Excel",
  description: "رفع ملف Excel أو CSV — متاح لمدير النظام (Super Admin) فقط.",
  templateFilename: "users-import-template.csv",
  templateColumns: ["name", "email", "phone", "gender", "is_active", "roles"],
  templateSampleRow: ["أحمد علي", "ahmed@marsal.io", "01012345678", "male", "1", "super_admin"],
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
    "internal_code",
    "company_ref",
    "shipping_company",
    "recipient_name",
    "recipient_phone",
    "city",
    "amount",
    "status",
  ],
  templateSampleRow: [
    "MR-2901",
    "SHP-88421",
    "أرامكس مصر",
    "محمد أحمد",
    "01012345678",
    "مدينة نصر",
    "275.00",
    "pending_assignment",
  ],
  previewColumns: [
    { key: "internal_code", label: "الكود الداخلي" },
    { key: "company_ref", label: "مرجع الشركة" },
    { key: "shipping_company", label: "شركة الشحن" },
    { key: "recipient_name", label: "المستلم" },
    { key: "recipient_phone", label: "الهاتف" },
    { key: "city", label: "المدينة" },
    { key: "amount", label: "المبلغ" },
    { key: "status", label: "الحالة" },
  ],
  rowKey: "internal_code",
  importButtonLabel: "استيراد الطلبات",
  successMessage: (count) => `تم استيراد ${count} طلب بنجاح.`,
  // onDownloadTemplate / onImport: wire these up when the shipments API is ready
};
