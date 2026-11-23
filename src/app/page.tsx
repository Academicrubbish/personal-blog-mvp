import Link from "next/link";
import { db } from "@/lib/db";
import SiteShell from "@/components/SiteShell";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export default async function Home() {
  const posts = await db.post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } });

  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-20">
      <section className="mb-16 grid gap-8 border-b border-[var(--line)] pb-12 md:grid-cols-[1.2fr_.8fr] md:items-end">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Personal Notes</p>
          <h1 className="font-serif text-5xl font-medium leading-[1.08] tracking-[-0.04em] text-[var(--ink)] sm:text-7xl">记录想法，<br />分享经验。</h1>
        </div>
        <p className="max-w-sm text-base leading-8 text-[var(--muted)] md:pb-1">一块属于自己的安静空间。写下正在思考的事，也留下走过的路。</p>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span>最新文章</span>
          <span>{String(posts.length).padStart(2, "0")} 篇</span>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {posts.length === 0 ? <p className="py-10 text-[var(--muted)]">还没有发布文章，去后台写下第一篇吧。</p> : posts.map((post, index) => (
            <article key={post.id} className="group py-8 first:pt-6">
              <Link href={`/posts/${post.slug}`} className="grid gap-4 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
                <span className="font-mono text-sm text-[var(--soft)]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]"><span>{formatDate(post.publishedAt ?? post.createdAt)}</span><span>·</span><span className="text-[var(--accent)]">{post.category}</span></div>
                  <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] sm:text-3xl">{post.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">{post.excerpt || "点击阅读全文"}</p>
                </div>
                <span className="hidden pt-1 text-xs text-[var(--soft)] transition-transform group-hover:translate-x-1 sm:block">阅读 →</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
      </main>
    </SiteShell>
  );
}
