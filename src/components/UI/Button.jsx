import './UI.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    fullWidth && 'btn-full',
    icon && 'btn-icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
