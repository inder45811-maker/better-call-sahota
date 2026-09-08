'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
export function Choice({
  id,
  label,
  value,
  onChange,
  options,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div className="field">
      <label id={id + '-label'} htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p id={id + '-hint'} className="field-hint">
          {hint}
        </p>
      )}
      <Select value={value} onValueChange={(v) => v !== null && onChange(v)} items={options}>
        <SelectTrigger
          className="field-select"
          id={id}
          aria-labelledby={id + '-label'}
          aria-describedby={hint ? id + '-hint' : undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="form-select-menu">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function CheckField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="check-field">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
