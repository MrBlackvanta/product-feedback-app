import type { KeyboardEvent } from "react";

export default function submitOnCtrlEnter(
  event: KeyboardEvent<HTMLTextAreaElement>,
) {
  if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return;

  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}
