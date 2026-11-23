"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "登录失败");
      setLoading(false);
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-brand"><span className="admin-logo-mark">P</span><div><strong>Personal Blog</strong><small>管理后台</small></div></div>
        <div className="admin-login-heading"><h1>登录后台</h1><p>使用管理员账号继续。</p></div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <label><span>邮箱</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
          <label><span>密码</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required /></label>
          {error && <p className="admin-login-error">{error}</p>}
          <button disabled={loading}>{loading ? "正在登录…" : "登录"}</button>
        </form>
        <div className="admin-login-footer"><Link href="/">返回前台</Link><span>本地默认：admin@example.com / admin123</span></div>
      </div>
    </main>
  );
}
