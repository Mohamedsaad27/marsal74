import { useCallback, useMemo, useState } from "react";

export type CrudMode = "create" | "edit" | null;

export type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
} | null;

/** Design-only local state for admin CRUD pages */
export function useAdminCrud<T extends { id: number | string }>(initialRows: T[]) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [crudMode, setCrudMode] = useState<CrudMode>(null);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page]);

  const openCreate = useCallback(() => {
    setCrudMode("create");
    setEditingRow(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: T) => {
    setCrudMode("edit");
    setEditingRow(row);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setCrudMode(null);
    setEditingRow(null);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      if (prev.size === ids.length) return new Set();
      return new Set(ids);
    });
  }, []);

  const requestBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    setConfirmAction({
      title: "حذف العناصر المحددة",
      description: `هل أنت متأكد من حذف ${selectedIds.size} عنصر؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabel: "حذف المحدد",
      variant: "destructive",
      onConfirm: () => {
        setRows((r) => r.filter((row) => !selectedIds.has(String(row.id))));
        setSelectedIds(new Set());
        setConfirmAction(null);
      },
    });
  }, [selectedIds]);

  const requestDelete = useCallback((row: T, label: string) => {
    setConfirmAction({
      title: "تأكيد الحذف",
      description: `هل أنت متأكد من حذف «${label}»؟`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: () => {
        setRows((r) => r.filter((item) => item.id !== row.id));
        setConfirmAction(null);
      },
    });
  }, []);

  const simulateSave = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      closeForm();
    }, 400);
  }, [closeForm]);

  return {
    rows,
    setRows,
    search,
    setSearch,
    page,
    setPage,
    loading,
    setLoading,
    selectedIds,
    setSelectedIds,
    crudMode,
    editingRow,
    formOpen,
    setFormOpen,
    confirmAction,
    setConfirmAction,
    filteredRows,
    paginatedRows,
    totalPages,
    pageSize,
    openCreate,
    openEdit,
    closeForm,
    toggleSelect,
    toggleSelectAll,
    requestBulkDelete,
    requestDelete,
    simulateSave,
  };
}
