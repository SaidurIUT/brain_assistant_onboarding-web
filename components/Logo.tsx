import Link from "next/link";

type LogoProps = {
  href?: string;
  compact?: boolean;
  label?: string;
};

export function Logo({ href = "/", compact = false, label = "Brain Assistant 23" }: LogoProps) {
  return (
    <Link className="brand" href={href}>
      <div className="logo-mark" style={compact ? { width: 24, height: 24, fontSize: ".65rem" } : undefined}>
        BA
      </div>
      <span>{label}</span>
    </Link>
  );
}
