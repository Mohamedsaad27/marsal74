import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Power, MapPin, Eye } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionModule } from "@/lib/auth/permission-keys";

type ExtraAction = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  action?: string; // action key within the module, e.g. "assign" — omit = always visible
};

type Props = {
  module: PermissionModule; // NEW — one prop for the whole row's permission context
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
  isActive?: boolean;
  extra?: ExtraAction[];
};

export function RowActions({
  module,
  onEdit,
  onDelete,
  onToggleActive,
  activeLabel = "تعطيل",
  inactiveLabel = "تفعيل",
  isActive = true,
  extra = [],
}: Props) {
  const { canDo } = usePermissions();

  const showEdit = onEdit && canDo(module, "update" as never);
  const showDelete = onDelete && canDo(module, "delete" as never);
  const showToggle = onToggleActive && canDo(module, "toggle" as never);
  const visibleExtra = extra.filter((e) => !e.action || canDo(module, e.action as never));

  if (!showEdit && !showDelete && !showToggle && visibleExtra.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="rounded-xl" dir="rtl">
        {showEdit && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onEdit!();
            }}
          >
            <Pencil className="ml-2 h-4 w-4" />
            تعديل
          </DropdownMenuItem>
        )}

        {visibleExtra.map((e) => (
          <DropdownMenuItem
            key={e.label}
            onSelect={(ev) => {
              ev.preventDefault();
              e.onClick();
            }}
          >
            {e.icon ?? <Eye className="ml-2 h-4 w-4" />}
            {e.label}
          </DropdownMenuItem>
        ))}

        {showToggle && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onToggleActive!();
            }}
          >
            <Power className="ml-2 h-4 w-4" />
            {isActive ? activeLabel : inactiveLabel}
          </DropdownMenuItem>
        )}

        {showDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                onDelete!();
              }}
            >
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export { MapPin };
