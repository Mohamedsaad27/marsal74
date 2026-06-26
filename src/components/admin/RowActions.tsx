import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Power, MapPin, Eye } from "lucide-react";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
  isActive?: boolean;
  extra?: { label: string; icon?: React.ReactNode; onClick: () => void }[];
};

export function RowActions({
  onEdit,
  onDelete,
  onToggleActive,
  activeLabel = "تعطيل",
  inactiveLabel = "تفعيل",
  isActive = true,
  extra = [],
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="rounded-xl" dir="rtl">
        {onEdit && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onEdit();
            }}
          >
            <Pencil className="ml-2 h-4 w-4" />
            تعديل
          </DropdownMenuItem>
        )}

        {extra.map((e) => (
          <DropdownMenuItem
            key={e.label}
            onSelect={(event) => {
              event.preventDefault();
              e.onClick();
            }}
          >
            {e.icon ?? <Eye className="ml-2 h-4 w-4" />}
            {e.label}
          </DropdownMenuItem>
        ))}

        {onToggleActive && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onToggleActive();
            }}
          >
            <Power className="ml-2 h-4 w-4" />
            {isActive ? activeLabel : inactiveLabel}
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(event) => {
                event.preventDefault();
                onDelete();
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
