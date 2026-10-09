type IconProps = React.SVGProps<SVGSVGElement>;

export function CheckIcon(props: IconProps) {
  return (
    <svg
      width="13"
      height="11"
      viewBox="0 0 13 11"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M1 5.233L4.522 9 12 1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
