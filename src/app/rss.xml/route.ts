import { db } from "@/lib/db";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const posts = await db.post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 50 });
  const items = posts.map((post) => `<item><title><![CDATA[${post.title}]]></title><link>${baseUrl}/posts/${post.slug}</link><guid>${baseUrl}/posts/${post.slug}</guid><pubDate>${(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate><description><![CDATA[${post.excerpt}]]></description></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>个人博客</title><link>${baseUrl}</link><description>记录想法，分享经验。</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
