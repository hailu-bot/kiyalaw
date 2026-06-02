"use client";

import React from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Table as TableIcon, List, ListOrdered, CheckSquare, Highlighter,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon, Type, SplitSquareHorizontal,
  Quote, Code, Link as LinkIcon, Image as ImageIcon, Sun,
} from "lucide-react";

interface DocumentToolbarProps {
  editor: Editor;
  isFocused: boolean;
  onToggleFocus: () => void;
}

const FONTS = [
  "Inter", "Arial", "Verdana", "Tahoma", "Trebuchet MS", "Calibri",
  "Playfair Display", "Georgia", "Times New Roman", "Cambria", "Garamond", "Book Antiqua",
  "Courier New", "Lucida Console",
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 60, 72];

function ToolbarBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded hover:bg-surface-container cursor-pointer ${active ? "bg-surface-container-highest text-secondary" : "text-on-surface"}`}>
      {children}
    </button>
  );
}

export default function DocumentToolbar({ editor, isFocused, onToggleFocus }: DocumentToolbarProps) {
  const currentFont = editor.getAttributes('textStyle').fontFamily || '';
  const currentSize = editor.getAttributes('textStyle').fontSize || '';

  return (
    <div className="bg-surface-container-low border-b border-outline-variant p-2 flex flex-wrap items-center gap-0.5 select-none">

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><Bold className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><Italic className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><span className="underline text-sm font-bold">U</span></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript"><SuperscriptIcon className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript"><SubscriptIcon className="w-4 h-4" /></ToolbarBtn>

      <span className="w-px h-5 bg-outline-variant mx-1" />

      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left"><AlignLeft className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center"><AlignCenter className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right"><AlignRight className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Align Justify"><AlignJustify className="w-4 h-4" /></ToolbarBtn>

      <span className="w-px h-5 bg-outline-variant mx-1" />

      <select value={currentSize} onChange={(e) => { const v = e.target.value; if (v) editor.chain().focus().setFontSize(v).run(); else editor.chain().focus().unsetFontSize().run(); }}
        className="bg-white border border-outline text-xs px-1.5 py-1 rounded w-14 text-on-surface">
        <option value="">Size</option>
        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select value={currentFont} onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        className="bg-white border border-outline text-xs px-1.5 py-1 rounded w-28 text-on-surface">
        <option value="">Font</option>
        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      <input type="color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent" title="Text Color" />

      <span className="w-px h-5 bg-outline-variant mx-1" />

      <select onChange={(e) => { const v = e.target.value; if (v === "p") editor.chain().focus().setParagraph().run(); else editor.chain().focus().toggleHeading({ level: parseInt(v) as 1 | 2 | 3 | 4 | 5 | 6 }).run(); }}
        className="bg-white border border-outline text-xs px-2 py-1 rounded text-on-surface">
        <option value="p">Paragraph</option>
        <option value="1">H1</option>
        <option value="2">H2</option>
        <option value="3">H3</option>
        <option value="4">H4</option>
        <option value="5">H5</option>
        <option value="6">H6</option>
      </select>

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")}><CheckSquare className="w-4 h-4" /></ToolbarBtn>

      <span className="w-px h-5 bg-outline-variant mx-1" />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block"><Code className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: "#ffe089" }).run()} active={editor.isActive("highlight")} title="Highlight"><Highlighter className="w-4 h-4 text-secondary" /></ToolbarBtn>

      <span className="w-px h-5 bg-outline-variant mx-1" />

      <ToolbarBtn onClick={() => { const u = window.prompt('URL'); if (u) editor.chain().focus().setLink({ href: u }).run(); }} active={editor.isActive("link")} title="Insert Link"><LinkIcon className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => { const u = window.prompt('Image URL'); if (u) editor.chain().focus().setImage({ src: u }).run(); }} title="Insert Image"><ImageIcon className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().insertPageBreak().run()} title="Page Break"><SplitSquareHorizontal className="w-4 h-4 text-primary" /></ToolbarBtn>

      <ToolbarBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table"><TableIcon className="w-4 h-4" /></ToolbarBtn>

      {editor.isActive("table") && (
        <div className="flex items-center gap-1 bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant animate-fade-in ml-1">
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="text-[10px] px-1 hover:bg-white rounded cursor-pointer">Col+</button>
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className="text-[10px] px-1 hover:bg-white rounded cursor-pointer">Row+</button>
          <button onClick={() => editor.chain().focus().deleteColumn().run()} className="text-[10px] px-1 hover:bg-white text-error rounded cursor-pointer">Col-</button>
          <button onClick={() => editor.chain().focus().deleteRow().run()} className="text-[10px] px-1 hover:bg-white text-error rounded cursor-pointer">Row-</button>
          <button onClick={() => editor.chain().focus().deleteTable().run()} className="text-[10px] px-1 hover:bg-white text-error font-bold rounded cursor-pointer">Del</button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1 pr-2">
        <ToolbarBtn onClick={onToggleFocus} active={isFocused} title="Focus Mode">
          <Sun className="w-4 h-4" />
        </ToolbarBtn>
        <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1">
          <Type className="w-3 h-3" /> {editor.storage.characterCount.words()} words
        </span>
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}><Undo className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}><Redo className="w-4 h-4" /></ToolbarBtn>
      </div>
    </div>
  );
}
