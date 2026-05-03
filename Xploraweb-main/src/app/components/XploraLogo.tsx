import logoFull from "../../imports/Xplora_logo-2.png";
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
    />
  );
}
