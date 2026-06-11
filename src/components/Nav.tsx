const LINKS: [string, string][] = [
  ["#strategist", "Strategist"],
  ["#dashboard", "Dashboard"],
  ["#about", "Build"],
  ["#methodology", "Data"],
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md border-b border-edge">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
        <a href="#top" className="text-[13px] font-semibold tracking-tight shrink-0">
          <span className="text-accent">macro</span>-desk
        </a>
        <div className="flex items-center gap-3 sm:gap-5 min-w-0 overflow-x-auto">
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-[11px] uppercase tracking-[0.14em] text-mut hover:text-ink transition-colors whitespace-nowrap"
            >
              {label}
            </a>
          ))}
          <a
            href="mailto:sehajmarjaraa@gmail.com?subject=macro-desk"
            className="hidden min-[480px]:inline-flex shrink-0 text-[11px] px-3 py-1.5 border border-accent/50 text-accent hover:bg-accent/10 transition-colors whitespace-nowrap"
          >
            Get in touch
          </a>
        </div>
      </div>
    </nav>
  );
}
