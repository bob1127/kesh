export const CartIcon = ({ fill = "black", size, height, width, ...props }) => (
  <svg
    fill={fill}
    height={size || height || 24}
    viewBox="0 0 24 24"
    width={size || width || 24}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 3h2l3.6 9.59A2 2 0 0 0 10.5 14H17a2 2 0 0 0 1.9-1.42L21 7H6"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <circle cx="9" cy="19" r="1" stroke={fill} strokeWidth={1.5} />
    <circle cx="17" cy="19" r="1" stroke={fill} strokeWidth={1.5} />
  </svg>
);

export const InstagramIcon = ({
  fill = "black",
  size,
  height,
  width,
  ...props
}) => (
  <svg
    fill={fill}
    height={size || height || 24}
    viewBox="0 0 24 24"
    width={size || width || 24}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
      stroke={fill}
      strokeWidth={1.5}
      fill="none"
    />
    <circle cx="12" cy="12" r="4" stroke={fill} strokeWidth={1.5} fill="none" />
    <circle cx="17.5" cy="6.5" r="1" fill={fill} />
  </svg>
);

export const LineIcon = ({ fill = "black", size, height, width, ...props }) => (
  <svg
    fill={fill}
    height={size || height || 24}
    viewBox="0 0 24 24"
    width={size || width || 24}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M19.5 4.5C17.2 2.9 14.2 2 12 2S6.8 2.9 4.5 4.5C2.6 5.9 1.5 8 1.5 10.3c0 3.7 3.3 6.8 7.7 7.8-.2.6-.7 2.2-.8 2.5 0 0-.1.4.2.5.3.2.5 0 .5 0 .7-.1 2.6-1.7 3-2.1 3.6.5 7.4-.5 9.5-2.6 1.8-1.8 2.9-4.2 2.9-6.7 0-2.3-1.1-4.4-3-5.7z" />
  </svg>
);

export const UserIcon = ({ fill = "black", size, height, width, ...props }) => (
  <svg
    fill="none"
    height={size || height || 24}
    viewBox="0 0 24 24"
    width={size || width || 24}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="8" r="4" stroke={fill} strokeWidth={1.5} />
    <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke={fill} strokeWidth={1.5} />
  </svg>
);
