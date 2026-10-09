type IconProps = React.SVGProps<SVGSVGElement>;

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg
      width="7"
      height="10"
      viewBox="0 0 7 10"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M6 9L2 5l4-4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
