type IconProps = React.SVGProps<SVGSVGElement>;

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M1 6l4-4 4 4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
