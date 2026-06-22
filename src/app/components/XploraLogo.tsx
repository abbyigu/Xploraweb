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
      className={className}
      style={variant === "full" ? { mixBlendMode: 'multiply' } : undefined}
    />
  );
}
