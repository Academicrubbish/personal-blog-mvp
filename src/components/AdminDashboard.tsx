"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MarkdownEditor from "@/components/MarkdownEditor";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  status: string;
  coverImage: string | null;
  updatedAt: string;
};

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  status: string;
  coverImage: string;
};

type MenuKey = "overview" | "posts" | "taxonomy" | "media";

const emptyForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "随笔",
  tags: "",
  status: "DRAFT",
  coverImage: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<MenuKey>("overview");
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadPosts() {
    const response = await fetch("/api/posts", { cache: "no-store" });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    setPosts(await response.json());
  }

  useEffect(() => {
    void (async () => { await loadPosts(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => Array.from(new Set(posts.map((post) => post.category).filter(Boolean))), [posts]);
  const tags = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.tags.split(",").map((tag) => tag.trim()).filter(Boolean)))), [posts]);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startNewPost() {
    reset();
    setNotice("");
    setActiveMenu("posts");
  }

  function edit(post: Post) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags,
      status: post.status,
      coverImage: post.coverImage ?? "",
    });
    setActiveMenu("posts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const url = editingId ? "/api/posts/" + editingId : "/api/posts";
    const method = editingId ? "PATCH" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setNotice(data.error ?? "保存失败");
      setBusy(false);
      return;
    }
    setNotice(editingId ? "文章已更新" : "文章已创建");
    reset();
    await loadPosts();
    setBusy(false);
  }

  async function remove(id: number) {
    if (!window.confirm("确定删除这篇文章吗？删除后无法恢复。")) return;
    await fetch("/api/posts/" + id, { method: "DELETE" });
    await loadPosts();
    if (editingId === id) reset();
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json();
    if (response.ok) {
      update("coverImage", data.url);
      setNotice("图片已上传，可作为当前文章封面使用");
    } else {
      setNotice(data.error ?? "上传失败");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function renderOverview() {
    const published = posts.filter((post) => post.status === "PUBLISHED").length;
    const drafts = posts.length - published;
    return (
      <div className="admin-page">
        <div className="admin-page-heading"><div><p className="admin-eyebrow">Overview</p><h1>概览</h1><p>快速了解博客内容状态。</p></div><button className="admin-primary-button" onClick={startNewPost}>+ 新建文章</button></div>
        <div className="admin-stat-grid">
          <div className="admin-stat-card"><span>文章总数</span><strong>{posts.length}</strong><small>全部文章</small></div>
          <div className="admin-stat-card"><span>已发布</span><strong>{published}</strong><small>公开可见</small></div>
          <div className="admin-stat-card"><span>草稿</span><strong>{drafts}</strong><small>等待继续编辑</small></div>
          <div className="admin-stat-card"><span>分类</span><strong>{categories.length}</strong><small>{tags.length} 个标签</small></div>
        </div>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>最近更新</h2><p>按最后修改时间排列。</p></div><button className="admin-text-button" onClick={() => setActiveMenu("posts")}>查看全部 →</button></div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>文章</th><th>分类</th><th>状态</th><th>更新时间</th><th /></tr></thead><tbody>{posts.slice(0, 5).map((post) => <tr key={post.id}><td><button className="admin-row-link" onClick={() => edit(post)}>{post.title}</button><small>{post.slug}</small></td><td>{post.category}</td><td><span className={"status-badge " + (post.status === "PUBLISHED" ? "is-published" : "is-draft")}>{post.status === "PUBLISHED" ? "已发布" : "草稿"}</span></td><td>{formatDate(post.updatedAt)}</td><td><button className="admin-row-action" onClick={() => edit(post)}>编辑</button></td></tr>)}</tbody></table></div>
        </section>
      </div>
    );
  }

  function renderPosts() {
    return (
      <div className="admin-page">
        <div className="admin-page-heading"><div><p className="admin-eyebrow">Content</p><h1>{editingId ? "编辑文章" : "文章管理"}</h1><p>创建、编辑和发布你的文章。</p></div><button className="admin-primary-button" onClick={startNewPost}>+ 新建文章</button></div>
        <div className="admin-editor-layout">
          <form onSubmit={save} className="admin-panel admin-editor-form">
            <div className="admin-panel-heading compact"><div><h2>{editingId ? "编辑文章" : "新建文章"}</h2><p>{editingId ? "修改后保存即可更新前台内容。" : "写完后可以先保存草稿，再发布。"}</p></div>{editingId && <button type="button" className="admin-text-button" onClick={reset}>取消编辑</button>}</div>
            <div className="admin-field"><label htmlFor="post-title">标题</label><input id="post-title" value={form.title} onChange={(event) => update("title", event.target.value)} required placeholder="例如：软件与资源选择" /></div>
            <div className="admin-field-grid"><div className="admin-field"><label htmlFor="post-slug">URL 别名</label><input id="post-slug" value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="留空自动生成" /></div><div className="admin-field"><label htmlFor="post-category">分类</label><input id="post-category" value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="随笔" /></div></div>
            <div className="admin-field"><label htmlFor="post-tags">标签</label><input id="post-tags" value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="多个标签用逗号分隔，例如：软件,NAS,教程" /></div>
            <div className="admin-field"><label htmlFor="post-excerpt">摘要</label><textarea id="post-excerpt" value={form.excerpt} onChange={(event) => update("excerpt", event.target.value)} rows={2} placeholder="显示在首页和 RSS 中的一句话摘要" /></div>
            <div className="admin-field"><label>正文</label><MarkdownEditor value={form.content} onChange={(value) => update("content", value)} /></div>
            <div className="admin-field-grid"><div className="admin-field"><label htmlFor="cover-image">封面图地址</label><input id="cover-image" value={form.coverImage} onChange={(event) => update("coverImage", event.target.value)} placeholder="/uploads/..." /></div><div className="admin-field"><label htmlFor="cover-upload">上传封面图</label><input id="cover-upload" type="file" accept="image/*" onChange={upload} /></div></div>
            {notice && <p className="admin-notice">{notice}</p>}
            <div className="admin-form-actions"><button disabled={busy} className="admin-primary-button">{busy ? "保存中…" : form.status === "PUBLISHED" ? "保存并发布" : "保存草稿"}</button><button type="button" className="admin-secondary-button" onClick={() => update("status", form.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}>切换为{form.status === "PUBLISHED" ? "草稿" : "发布"}</button></div>
          </form>
          <section className="admin-panel admin-post-list"><div className="admin-panel-heading compact"><div><h2>文章列表</h2><p>{posts.length} 篇文章</p></div></div><div className="admin-list">{posts.map((post) => <div key={post.id} className={"admin-list-item " + (editingId === post.id ? "is-active" : "")}><button onClick={() => edit(post)}><strong>{post.title}</strong><span>{post.status === "PUBLISHED" ? "已发布" : "草稿"} · {post.category}</span></button><button className="admin-delete-button" onClick={() => remove(post.id)}>删除</button></div>)}</div></section>
        </div>
      </div>
    );
  }

  function renderTaxonomy() {
    return (
      <div className="admin-page">
        <div className="admin-page-heading"><div><p className="admin-eyebrow">Organization</p><h1>分类与标签</h1><p>从文章内容中自动汇总当前使用情况。</p></div></div>
        <div className="admin-two-column"><section className="admin-panel"><div className="admin-panel-heading compact"><div><h2>分类</h2><p>{categories.length} 个分类</p></div></div><div className="taxonomy-list">{categories.map((category) => <div key={category}><span>{category}</span><strong>{posts.filter((post) => post.category === category).length}</strong></div>)}</div></section><section className="admin-panel"><div className="admin-panel-heading compact"><div><h2>标签</h2><p>{tags.length} 个标签</p></div></div><div className="tag-cloud">{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></section></div>
      </div>
    );
  }

  function renderMedia() {
    const mediaPosts = posts.filter((post) => post.coverImage);
    return (
      <div className="admin-page">
        <div className="admin-page-heading"><div><p className="admin-eyebrow">Media</p><h1>媒体库</h1><p>管理文章封面图片。正文图片也可以通过 Markdown 地址插入。</p></div></div>
        <section className="admin-panel"><div className="admin-panel-heading compact"><div><h2>已使用的封面图</h2><p>{mediaPosts.length} 张图片</p></div><button className="admin-primary-button" onClick={startNewPost}>上传并使用</button></div>{mediaPosts.length ? <div className="media-grid">{mediaPosts.map((post) => <div className="media-card" key={post.id}><Image src={post.coverImage ?? ""} alt="" width={640} height={360} /><div><strong>{post.title}</strong><small>{post.coverImage}</small></div></div>)}</div> : <div className="admin-empty">还没有上传封面图。</div>}</section>
      </div>
    );
  }

  const page = activeMenu === "overview" ? renderOverview() : activeMenu === "posts" ? renderPosts() : activeMenu === "taxonomy" ? renderTaxonomy() : renderMedia();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo"><span className="admin-logo-mark">P</span><div><strong>Personal Blog</strong><small>管理后台</small></div></div>
        <nav className="admin-nav">
          <button className={activeMenu === "overview" ? "is-active" : ""} onClick={() => setActiveMenu("overview")}><span>⌂</span>概览</button>
          <button className={activeMenu === "posts" ? "is-active" : ""} onClick={() => setActiveMenu("posts")}><span>▤</span>文章</button>
          <button className={activeMenu === "taxonomy" ? "is-active" : ""} onClick={() => setActiveMenu("taxonomy")}><span>◈</span>分类与标签</button>
          <button className={activeMenu === "media" ? "is-active" : ""} onClick={() => setActiveMenu("media")}><span>▧</span>媒体库</button>
        </nav>
        <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noreferrer">查看前台 ↗</a><button onClick={logout}>退出登录</button></div>
      </aside>
      <section className="admin-workspace"><header className="admin-topbar"><div><span className="admin-topbar-label">管理后台</span><span className="admin-topbar-divider">/</span><span>{activeMenu === "overview" ? "概览" : activeMenu === "posts" ? "文章" : activeMenu === "taxonomy" ? "分类与标签" : "媒体库"}</span></div><div className="admin-user"><span className="admin-avatar">站</span><span>站长</span></div></header>{page}</section>
    </div>
  );
}
