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
      style={variant === "full" ? { mixBlendMode: 'multiply' } : undefined}
    />
  );
}
