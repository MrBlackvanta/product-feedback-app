"use client";

type TextFieldProps = {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  attempt: number;
  multiline?: boolean;
};

export default function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  attempt,
  multiline,
}: TextFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const control = {
    id,
    name: id,
    required: true,
    value,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
    "aria-invalid": error ? ("true" as const) : undefined,
    "aria-describedby": error ? `${hintId} ${errorId}` : hintId,
  };

  return (
    <div>
      <label htmlFor={id} className="v-field-label">
        {label}
      </label>
      <p id={hintId} className="v-field-hint">
        {hint}
      </p>

      {multiline ? (
        <textarea {...control} className="v-field mt-4 h-30 md:h-24" />
      ) : (
        <input {...control} className="v-input mt-4" />
      )}

      {error && (
        <p key={attempt} id={errorId} role="alert" className="v-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
