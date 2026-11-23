# Personal Blog MVP

一个动态个人博客 MVP，包含：

- 首页文章列表和文章详情
- 单管理员登录
- 新建、编辑、删除文章
- 草稿 / 已发布状态
- 分类和标签
- Markdown 正文与代码高亮
- 封面图片上传
- RSS、SEO metadata 和 sitemap

## 技术栈

Next.js App Router、TypeScript、Prisma Client、SQLite、Tailwind CSS、JWT 会话。

## 本地运行

\`\`\`bash
npm install
npm run db:generate
npm run db:init
npm run db:seed
npm run dev
\`\`\`

打开 http://localhost:3000，后台地址是 http://localhost:3000/admin。

默认账号：

\`\`\`text
邮箱：admin@example.com
密码：admin123
\`\`\`

部署前请修改 .env 中的 AUTH_SECRET、ADMIN_EMAIL 和 ADMIN_PASSWORD。

## 数据库说明

MVP 使用 SQLite，数据库文件位于 prisma/dev.db。db:init 使用 scripts/init-db.sql 创建表，之后可以用 npm run db:studio 查看数据。

项目后续可以把 prisma/schema.prisma 的 provider 改成 PostgreSQL，再使用 Prisma migration 迁移到正式数据库。
