import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function FormField({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label className="block w-full text-right text-sm font-medium">
        {label}
        {required && <span className="text-destructive ms-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FormInput(
  props: React.ComponentProps<typeof Input> & { label: string; required?: boolean },
) {
  const { label, required, className, ...rest } = props;
  return (
    <FormField label={label} required={required}>
      <Input className={cn("rounded-xl text-right", className)} dir="rtl" {...rest} />
    </FormField>
  );
}

export function FormTextarea(
  props: React.ComponentProps<typeof Textarea> & { label: string; required?: boolean },
) {
  const { label, required, className, ...rest } = props;
  return (
    <FormField label={label} required={required}>
      <Textarea
        className={cn("min-h-[80px] rounded-xl text-start", className)}
        dir="rtl"
        {...rest}
      />
    </FormField>
  );
}

export function FormSwitch({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
      <Label className="text-start  font-medium">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />{" "}
    </div>
  );
}

export function FormSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = search.trim() ? options.filter((o) => o.label.includes(search.trim())) : options;

  return (
    <FormField label={label} required={required}>
      <Select
        value={value}
        onValueChange={onValueChange}
        onOpenChange={(open) => {
          if (!open) setSearch("");
        }}
      >
        <SelectTrigger className="rounded-xl text-right" dir="rtl">
          <SelectValue dir="rtl" placeholder={placeholder ?? "اختر..."} />
        </SelectTrigger>
        <SelectContent dir="rtl">
          <div className="p-2 border-b border-border" onPointerDown={(e) => e.stopPropagation()}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              placeholder="ابحث..."
              dir="rtl"
              className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm text-right outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
          </div>
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">لا توجد نتائج.</div>
          ) : (
            filtered.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </FormField>
  );
}
export function FormMultiCheckbox({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) onChange(selected.filter((s) => s !== value));
    else onChange([...selected, value]);
  };

  return (
    <FormField label={label}>
      <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(o.value)}
              onCheckedChange={() => toggle(o.value)}
            />
            <span className="font-mono text-xs">{o.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
}

export function FormPermissionsByModule({
  modules,
  permissions,
  selected,
  onChange,
}: {
  modules: readonly string[];
  permissions: { name: string; module: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (name: string) => {
    if (selected.includes(name)) onChange(selected.filter((s) => s !== name));
    else onChange([...selected, name]);
  };

  return (
    <div className="space-y-4">
      {modules.map((mod) => {
        const modPerms = permissions.filter((p) => p.module === mod);
        if (modPerms.length === 0) return null;
        return (
          <div key={mod} className="rounded-xl border border-border p-3">
            <p className="mb-2 text-start text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {mod}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {modPerms.map((p) => (
                <label key={p.name} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.includes(p.name)}
                    onCheckedChange={() => toggle(p.name)}
                  />
                  <span className="font-mono text-[11px]">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
