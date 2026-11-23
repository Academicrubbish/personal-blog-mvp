import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const posts = await db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
  return [{ url: baseUrl, lastModified: new Date() }, ...posts.map((post) => ({ url: `${baseUrl}/posts/${post.slug}`, lastModified: post.updatedAt }))];
}
