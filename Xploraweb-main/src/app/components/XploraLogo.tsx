import logoIcon from "../../imports/Favicon.png";

export function XploraLogo({
  className = "",
  variant = "icon"
}: {
  className?: string;
  variant?: "icon" | "full";
}) {
  if (variant === "icon") {
    return (
      <img
        src={logoIcon}
        alt="GoXplora"
        width={256}
        height={256}
        className={className}
        style={{ width: 'auto' }}
        fetchPriority="high"
      />
    );
  }

  return (
    <picture>
      <source srcSet="/goxplora-logo.webp" type="image/webp" />
      <img
        src="/goxplora-logo.png"
        alt="GoXplora"
        width={336}
        height={223}
        className={className}
        style={{ mixBlendMode: 'multiply', width: 'auto' }}
        fetchPriority="high"
      />
    </picture>
  );
}
