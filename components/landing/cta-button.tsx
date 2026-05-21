import Link from "next/link";
import type { ReactNode } from "react";

type CtaButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
};

export function CtaButton({
  children,
  href = "/dashboard",
  variant = "primary"
}: CtaButtonProps) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold uppercase transition duration-200 focus:outline-none focus:ring-2 focus:ring-titan-bright focus:ring-offset-2 focus:ring-offset-titan-black active:translate-y-0";
  const variants = {
    primary:
      "bg-titan-gold text-black shadow-gold hover:-translate-y-0.5 hover:bg-titan-bright hover:shadow-[0_20px_70px_rgba(244,211,123,0.24)]",
    secondary:
      "luxury-border bg-white/5 text-titan-ivory hover:-translate-y-0.5 hover:border-titan-bright hover:bg-white/10 hover:text-titan-bright"
  };

  return (
    <Link className={`${base} ${variants[variant]}`} href={href}>
      {children}
    </Link>
  );
}
