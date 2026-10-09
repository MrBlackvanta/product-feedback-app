type IconProps = React.SVGProps<SVGSVGElement>;

export function NewFeedbackIcon(props: IconProps) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <radialGradient
          id="new-feedback-gradient"
          cx="103.9%"
          cy="-10.387%"
          fx="103.9%"
          fy="-10.387%"
          r="166.816%"
        >
          <stop stopColor="#E84D70" offset="0%" />
          <stop stopColor="#A337F6" offset="53.089%" />
          <stop stopColor="#28A7ED" offset="100%" />
        </radialGradient>
      </defs>
      <circle fill="url(#new-feedback-gradient)" cx="28" cy="28" r="28" />
      <path
        fill="#FFF"
        d="M30.343 36v-5.834h5.686v-4.302h-5.686V20h-4.597v5.864H20v4.302h5.746V36z"
      />
    </svg>
  );
}
