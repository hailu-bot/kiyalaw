"use client";

import React, { useRef, useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import Image from "next/image";
import { Sparkles, Plus } from "lucide-react";
import { PAGE_CONTENT_HEIGHT } from "@/lib/constants";
import { useDocumentStore } from "@/lib/store/useDocumentStore";
import type { PageStampConfig } from "@/lib/store/useDocumentStore";
import styles from "./TipTapWorkspace.module.css";

interface EditorCanvasProps {
  editor: Editor | null;
  editorWrapperRef: React.RefObject<HTMLDivElement | null>;
  isFocused: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  pageGaps: Array<{ topPx: number; pageAbove: number; pageBelow: number }>;
  isAiOpen: boolean;
  onToggleAi: () => void;
}

export default function EditorCanvas({
  editor, editorWrapperRef, isFocused, scrollContainerRef, pageGaps, isAiOpen, onToggleAi,
}: EditorCanvasProps) {
  const docStore = useDocumentStore();
  const dragRef = useRef<{ page: number; dragging: boolean; startX: number; startY: number; initRight: number; initBottom: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d || !d.dragging) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      docStore.setPageStamp(d.page, {
        right: Math.max(0, d.initRight - dx),
        bottom: Math.max(0, d.initBottom - dy),
      });
    };
    const handleMouseUp = () => {
      if (dragRef.current?.dragging) {
        dragRef.current.dragging = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDrag = (e: React.MouseEvent, page: number, stamp: PageStampConfig) => {
    e.preventDefault();
    dragRef.current = {
      page,
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initRight: stamp.right,
      initBottom: stamp.bottom,
    };
    // eslint-disable-next-line react-hooks/immutability
    document.body.style.cursor = "grabbing";
    // eslint-disable-next-line react-hooks/immutability
    document.body.style.userSelect = "none";
  };

  const totalPages = Math.max(1, docStore.totalPages);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center custom-scrollbar relative">
      {!isAiOpen && (
        <button
          onClick={onToggleAi}
          className="panel-reopen-float flex items-center justify-center group"
          title="Open AI Assistant"
        >
          <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      <div
        ref={editorWrapperRef}
        className={`w-full max-w-[850px] bg-white shadow-xl border border-outline-variant rounded-sm px-10 py-12 sm:px-16 sm:py-16 relative flex flex-col justify-start my-4 transition-all duration-300 ${isFocused ? "ring-2 ring-secondary/40" : ""}`}
        style={{ minHeight: `${totalPages * PAGE_CONTENT_HEIGHT}px` }}
      >
        {pageGaps.map((gap, i) => (
          <div
            key={i}
            className="page-gap-separator"
            style={{ top: `${gap.topPx}px` }}
          >
            <div className="page-gap-label">
              Page {gap.pageBelow}
            </div>
          </div>
        ))}
        <style>{`
          .page-gap-separator {
            position: absolute;
            left: 0;
            right: 0;
            height: 0px;
            border-top: 1px dashed #D4AF37;
            pointer-events: none;
            z-index: 10;
            opacity: 0.6;
          }
          .page-gap-label {
            position: absolute;
            right: -60px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #D4AF37;
            white-space: nowrap;
            user-select: none;
          }
        `}</style>

        {Array.from({ length: totalPages }).map((_, i) => {
          const stamp = docStore.pageStamps[i];
          return (
            <div key={`page-hf-${i}`} className="absolute left-0 right-0 px-10 sm:px-16 pointer-events-none z-10" style={{ top: i * PAGE_CONTENT_HEIGHT, height: PAGE_CONTENT_HEIGHT }}>
              <header className="pt-6 pb-2 mb-6 select-none border-b-2 border-primary/20 bg-white/80 backdrop-blur-sm">
                <Image src="/Header.png" alt="Kiya Law" width={700} height={80} className="w-full h-auto object-contain" priority />
              </header>

              <footer className="absolute bottom-0 left-10 right-10 sm:left-16 sm:right-16 pb-12 pt-3 border-t border-outline-variant/50 select-none flex justify-between items-center text-[10px] text-on-tertiary-container font-semibold tracking-wide uppercase bg-white/80 backdrop-blur-sm">
                <p>Confidential & Privileged Work Product</p>
                <div className="flex gap-4">
                  <p>Ref: KL-{docStore.documentId?.slice(-6).toUpperCase() || 'DRAFT'}</p>
                  <p>Page {i + 1} of {totalPages}</p>
                </div>
              </footer>

              {stamp?.active && (
                <div
                  onMouseDown={(e) => startDrag(e, i, stamp)}
                  className="absolute select-none opacity-85 bg-white/50 backdrop-blur-[2px] transform -rotate-12 shadow-sm cursor-grab active:cursor-grabbing"
                  style={{ right: stamp.right, bottom: stamp.bottom, pointerEvents: "auto", width: 160, height: 160 }}
                >
                  <Image src="/kiya-stamp.png" alt="Stamp" width={160} height={160} className="w-full h-full object-contain" priority />
                </div>
              )}

              {!stamp?.active && (
                <button
                  onClick={() => docStore.setPageStamp(i, { active: true })}
                  className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-dashed border-outline-variant text-on-surface-variant hover:bg-surface-container-hover hover:text-secondary transition-all opacity-40 hover:opacity-100"
                  style={{ right: 40, bottom: 112, pointerEvents: "auto" }}
                  title="Add stamp to this page"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        <div className={`flex-1 prose prose-sm sm:prose-base prose-slate max-w-full font-body-doc text-body-doc focus:outline-none pt-24 pb-24 z-0 relative ${styles.editorProseMirror}`}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="page-indicator-pill animate-fade-in-up mt-8">
          <span className="opacity-80">Page</span>
          <span className="page-current">{docStore.currentPage}</span>
          <span className="opacity-60">of {totalPages}</span>
        </div>
      )}
    </div>
  );
}
