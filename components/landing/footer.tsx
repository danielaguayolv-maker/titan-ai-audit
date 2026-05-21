export function Footer() {
  return (
    <footer className="border-t border-titan-gold/10 px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-titan-ivory/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Titan AI Audit. Premium AI audits for local businesses.</p>
        <div className="flex gap-5">
          <a className="hover:text-titan-bright" href="#features">
            Features
          </a>
          <a className="hover:text-titan-bright" href="#lead-capture">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
