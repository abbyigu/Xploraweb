import logoFull from "../../imports/Xplora_logo_new.png";
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
      src={variant === "icon" ? logoIcon : logoFull}
      alt="Xplora"
      className={className}
      width={variant === "full" ? 300 : 64}
      height={variant === "full" ? 200 : 64}
      style={variant === "full" ? { mixBlendMode: 'multiply' } : undefined}
      fetchPriority="high"
    />
  );
}
