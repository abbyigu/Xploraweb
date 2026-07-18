import logoIcon from "../../imports/Favicon.png";

export function XploraLogo({
  className = "",
  variant = "icon"
}: {
  className?: string;
  variant?: "icon" | "full";
}) {
  return (
    <img
      src={variant === "icon" ? logoIcon : "/goxplora-logo.png"}
      alt="GoXplora"
      width={variant === "icon" ? 256 : 336}
      height={variant === "icon" ? 256 : 223}
      className={className}
      style={variant === "full" ? { mixBlendMode: 'multiply', width: 'auto' } : { width: 'auto' }}
      fetchPriority="high"
    />
  );
}
