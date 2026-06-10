import { ImportExcelDialog } from "@/components/admin/ImportExcelDialog";
import { usersImportConfig } from "@/lib/admin/import-excel-configs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (count: number) => void;
};

/** @deprecated Use <ImportExcelDialog config={usersImportConfig} /> directly */
export function ImportUsersDialog(props: Props) {
  return <ImportExcelDialog {...props} config={usersImportConfig} />;
}
