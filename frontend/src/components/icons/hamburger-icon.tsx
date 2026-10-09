type IconProps = React.SVGProps<SVGSVGElement>;

export function HamburgerIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="17"
      viewBox="0 0 20 17"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g fill="currentColor">
        <path d="M0 0h20v3H0zM0 7h20v3H0zM0 14h20v3H0z" />
      </g>
    </svg>
  );
}
