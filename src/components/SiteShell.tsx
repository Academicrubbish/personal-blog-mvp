import Link from "next/link";

export default function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-brand">个人博客</Link>
          <nav className="site-nav">
            <Link href="/">首页</Link>
            <Link href="/rss.xml">RSS</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="site-footer">© {new Date().getFullYear()} 个人博客 · 用文字留下痕迹</footer>
    </div>
  );
}
