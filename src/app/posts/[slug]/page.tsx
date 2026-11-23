import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { renderMarkdown, splitTags } from "@/lib/markdown";
import SiteShell from "@/components/SiteShell";

type Context = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") return { title: "文章不存在" };
  return { title: post.title, description: post.excerpt || post.title };
}

export default async function PostPage({ params }: Context) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") notFound();

  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-20">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">← 返回首页</Link>
      <article className="mt-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]"><span>{post.category}</span><span>·</span><span>{new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(post.publishedAt ?? post.createdAt)}</span></div>
        <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-[var(--ink)] sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-5 text-xl leading-8 text-[var(--muted)]">{post.excerpt}</p>}
        <div className="mt-5 flex flex-wrap gap-2">{splitTags(post.tags).map((tag) => <span key={tag} className="rounded-full bg-[#e7dfd3] px-3 py-1 text-sm text-[var(--muted)]">#{tag}</span>)}</div>
        {post.coverImage && <Image src={post.coverImage} alt="" width={1200} height={675} className="mt-10 w-full rounded-sm border border-[var(--line)] object-cover" />}
        <div className="prose-blog mt-12" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
      </article>
      </main>
    </SiteShell>
  );
}
