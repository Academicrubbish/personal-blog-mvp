import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/markdown";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const body = (await request.json()) as Record<string, string | undefined>;
  const postId = Number(id);
  if (!Number.isInteger(postId)) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  const existing = await db.post.findUnique({ where: { id: postId } });
  if (!existing) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const post = await db.post.update({
    where: { id: postId },
    data: {
      title: body.title?.trim() || existing.title,
      slug: slugify(body.slug || existing.slug),
      excerpt: body.excerpt?.trim() ?? existing.excerpt,
      content: body.content ?? existing.content,
      category: body.category?.trim() || existing.category,
      tags: body.tags?.trim() ?? existing.tags,
      coverImage: body.coverImage?.trim() || null,
      status,
      publishedAt: status === "PUBLISHED" ? existing.publishedAt ?? new Date() : null,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  await db.post.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
