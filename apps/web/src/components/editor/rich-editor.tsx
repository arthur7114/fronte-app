"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react"
import type { Editor } from "@tiptap/core"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table"
import { TableCell } from "@tiptap/extension-table"
import { TableHeader } from "@tiptap/extension-table"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import { createLowlight, common } from "lowlight"
import { EditorBubbleMenu } from "./editor-bubble-menu"
import { SlashCommandExtension } from "./editor-slash-commands"

// ---------------------------------------------------------------------------
// Lowlight instance
// ---------------------------------------------------------------------------

const lowlight = createLowlight(common)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RichEditorRef = {
  getHTML: () => string
  getText: () => string
  getWordCount: () => number
  getEditor: () => Editor | null
}

export type RichEditorProps = {
  content: string
  onChange: (html: string) => void
  editable?: boolean
  placeholder?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const RichEditor = forwardRef<RichEditorRef, RichEditorProps>(
  ({ content, onChange, editable = true, placeholder = "Comece a escrever ou pressione / para ver os comandos..." }, ref) => {
    const [aiLoading, setAiLoading] = useState<"expand" | "rewrite" | null>(null)

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false,
          heading: { levels: [1, 2, 3] },
        }),
        Image.configure({ inline: false, allowBase64: false }),
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        CodeBlockLowlight.configure({ lowlight }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class: "text-primary underline underline-offset-4 cursor-pointer",
          },
        }),
        Placeholder.configure({ placeholder }),
        CharacterCount,
        SlashCommandExtension,
      ],
      content,
      editable,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
      editorProps: {
        attributes: {
          class: [
            "focus:outline-none min-h-[500px] px-6 py-5",
            "text-sm leading-relaxed text-foreground",
            // headings
            "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-foreground",
            "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-foreground",
            "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground",
            // paragraphs & spacing
            "[&_p]:mb-3 [&_p]:text-foreground",
            "[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
            "[&_p.is-editor-empty:first-child]:before:text-muted-foreground",
            "[&_p.is-editor-empty:first-child]:before:pointer-events-none",
            "[&_p.is-editor-empty:first-child]:before:float-left",
            "[&_p.is-editor-empty:first-child]:before:h-0",
            // lists
            "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul_li]:mb-1",
            "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol_li]:mb-1",
            // blockquote
            "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40",
            "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4",
            // code
            "[&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto",
            "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-xs [&_pre_code]:leading-relaxed",
            "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono",
            // links
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
            // tables
            "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
            "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2",
            "[&_th]:bg-muted [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold",
            "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm",
            "[&_td]:align-top",
            // hr
            "[&_hr]:border-border [&_hr]:my-6",
            // images
            "[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4",
            // strong & em
            "[&_strong]:font-semibold",
            "[&_em]:italic",
          ].join(" "),
        },
      },
    })

    // Sync content when it changes from outside (e.g. after markdown conversion)
    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content, { emitUpdate: false })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content])

    // Toggle editable
    useEffect(() => {
      if (editor) {
        editor.setEditable(editable)
      }
    }, [editor, editable])

    // Expose imperative API
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? "",
      getText: () => editor?.getText() ?? "",
      getWordCount: () => {
        const text = (editor?.getText() ?? "").trim()
        return text ? text.split(/\s+/).length : 0
      },
      getEditor: () => editor ?? null,
    }))

    // AI action handler (bubble menu)
    const handleAiAction = useCallback(
      async (action: "expand" | "rewrite") => {
        if (!editor) return
        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to, " ")
        if (!selectedText.trim()) return

        setAiLoading(action)
        try {
          const res = await fetch("/api/editor-ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, content: selectedText }),
          })
          if (!res.ok) throw new Error("Erro na requisição")
          const data = await res.json()
          if (data.text) {
            editor.chain().focus().deleteSelection().insertContent(data.text).run()
          }
        } catch {
          // bubble menu closes naturally — no disruptive error
        } finally {
          setAiLoading(null)
        }
      },
      [editor],
    )

    return (
      <div className="relative w-full">
        {editor && (
          <EditorBubbleMenu
            editor={editor}
            onAiAction={handleAiAction}
            aiLoading={aiLoading}
          />
        )}
        <EditorContent editor={editor} />
      </div>
    )
  },
)

RichEditor.displayName = "RichEditor"
