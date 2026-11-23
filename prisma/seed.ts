import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: "站长" },
    create: { email, passwordHash, name: "站长" },
  });

  await prisma.post.upsert({
    where: { slug: "welcome-to-my-blog" },
    update: {},
    create: {
      slug: "welcome-to-my-blog",
      title: "欢迎来到我的博客",
      excerpt: "这是博客 MVP 的第一篇文章。",
      category: "随笔",
      tags: "博客,开始",
      status: "PUBLISHED",
      publishedAt: new Date(),
      content: `# 欢迎来到我的博客\n\n这是一个基于 Next.js、Prisma 和 SQLite 的动态博客 MVP。\n\n你可以登录后台创建、编辑和发布文章。`,
    },
  });
}

main().finally(() => prisma.$disconnect());
