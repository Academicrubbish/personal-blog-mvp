import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/markdown";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const posts = await db.post.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = (await request.json()) as {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    tags?: string;
    status?: string;
    coverImage?: string;
  };
  const title = body.title?.trim();
  const content = body.content ?? "";
  if (!title || !content.trim()) return NextResponse.json({ error: "标题和正文不能为空" }, { status: 400 });

  const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const post = await db.post.create({
    data: {
      title,
      slug: slugify(body.slug || title),
      excerpt: body.excerpt?.trim() ?? "",
      content,
      category: body.category?.trim() || "随笔",
      tags: body.tags?.trim() ?? "",
      coverImage: body.coverImage?.trim() || null,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });
  return NextResponse.json(post, { status: 201 });
}
