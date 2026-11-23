"use client";

import { useRef } from "react";
import { renderMarkdown } from "@/lib/markdown";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function MarkdownEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fence = String.fromCharCode(96).repeat(3);

  function insert(before: string, after = "", placeholder = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const inserted = before + (selected || placeholder) + after;
    onChange(value.slice(0, start) + inserted + value.slice(end));
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + inserted.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar">
        <button type="button" onClick={() => insert("**", "**", "粗体")} title="粗体"><strong>B</strong></button>
        <button type="button" onClick={() => insert("*", "*", "斜体")} title="斜体"><em>I</em></button>
        <button type="button" onClick={() => insert("## ", "", "二级标题")} title="标题">H2</button>
        <button type="button" onClick={() => insert("[", "](https://)", "链接文字")} title="链接">链接</button>
        <button type="button" onClick={() => insert("> ", "", "引用")} title="引用">引用</button>
        <button type="button" onClick={() => insert("- ", "", "列表项")} title="无序列表">列表</button>
        <button type="button" onClick={() => insert(String.fromCharCode(96), String.fromCharCode(96), "代码")} title="行内代码">代码</button>
        <button type="button" onClick={() => insert(fence + "ts\n", "\n" + fence, "const value = true;")} title="代码块">代码块</button>
        <button type="button" onClick={() => insert("| 项目 | 说明 |\n| --- | --- |\n| 内容 | 这里填写 |\n", "", "")} title="插入表格">表格</button>
        <button type="button" onClick={() => insert("![", "](/uploads/图片地址.png)", "图片描述")} title="图片">图片</button>
      </div>
      <div className="editor-panels">
        <div className="editor-pane">
          <div className="editor-pane-label">Markdown</div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required
            spellCheck={false}
            placeholder={"# 写下你的想法\n\n支持标题、表格、代码块、图片和链接。"}
          />
        </div>
        <div className="editor-pane editor-preview">
          <div className="editor-pane-label">实时预览</div>
          {value.trim() ? <div className="prose-blog" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} /> : <p className="editor-empty">输入 Markdown 后，这里会显示预览。</p>}
        </div>
      </div>
    </div>
  );
}
