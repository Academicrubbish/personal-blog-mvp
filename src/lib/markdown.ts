import DOMPurify from "isomorphic-dompurify";
import hljs from "highlight.js";
import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const renderer = new marked.Renderer();
renderer.code = function (token) {
  const code = typeof token === "object" && token !== null && "text" in token ? String(token.text) : String(token);
  const lang = typeof token === "object" && token !== null && "lang" in token ? String(token.lang ?? "") : "";
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = language === "plaintext" ? hljs.highlightAuto(code).value : hljs.highlight(code, { language }).value;
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

export function renderMarkdown(markdown: string) {
  const html = marked.parse(markdown, { renderer }) as string;
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["target", "rel"],
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "") || `post-${Date.now()}`;
}

export function splitTags(tags: string) {
  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}
