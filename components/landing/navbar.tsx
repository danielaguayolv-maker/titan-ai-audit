import { CtaButton } from "./cta-button";
import { TitanLogo } from "@/components/shared/titan-logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-titan-gold/10 bg-titan-black/72 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
      <a className="transition hover:opacity-90" href="#top" aria-label="Titan Visibility OS home">
        <TitanLogo label="Titan Visibility OS" />
      </a>
      <nav className="hidden items-center gap-8 text-sm font-medium text-titan-ivory/70 md:flex">
        <a className="transition hover:text-titan-bright" href="#features">
          Features
        </a>
        <a className="transition hover:text-titan-bright" href="#process">
          Process
        </a>
        <a className="transition hover:text-titan-bright" href="/dashboard">
          Dashboard
        </a>
        <a className="transition hover:text-titan-bright" href="#lead-capture">
          Contact
        </a>
      </nav>
      <div className="hidden sm:block">
        <CtaButton>Open OS</CtaButton>
      </div>
      </div>
    </header>
  );
}
