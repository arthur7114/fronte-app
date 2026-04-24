"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/core"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Loader2,
  Sparkles,
  Strikethrough,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BubbleMenuProps = {
  editor: Editor
  onAiAction: (action: "expand" | "rewrite") => Promise<void>
  aiLoading: "expand" | "rewrite" | null
}

// ---------------------------------------------------------------------------
// Small reusable button inside the bubble menu
// ---------------------------------------------------------------------------

function MenuButton({
  isActive = false,
  onClick,
  title,
  children,
  disabled,
}: {
  isActive?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-40",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Link button with inline URL popover
// ---------------------------------------------------------------------------

function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const isActive = editor.isActive("link")

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      editor.chain().focus().setLink({ href: url.trim() }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setOpen(false)
    setUrl("")
  }

  const handleOpen = (open: boolean) => {
    if (open) {
      const existing = editor.getAttributes("link").href as string | undefined
      setUrl(existing ?? "")
    }
    setOpen(open)
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          title="Link"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted",
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" side="bottom" align="start">
        <form onSubmit={handleApply} className="flex gap-2">
          <Input
            autoFocus
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" className="h-8 shrink-0 px-3">
            OK
          </Button>
        </form>
        {isActive && (
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetLink().run()
              setOpen(false)
            }}
            className="mt-2 text-xs text-destructive hover:underline"
          >
            Remover link
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function EditorBubbleMenu({ editor, onAiAction, aiLoading }: BubbleMenuProps) {
  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top" }}
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-border",
        "bg-popover px-1 py-1 shadow-lg",
      )}
    >
      {/* Formatting */}
      <MenuButton
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Negrito (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </MenuButton>

      <MenuButton
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Itálico (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </MenuButton>

      <MenuButton
        isActive={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Tachado"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </MenuButton>

      <LinkButton editor={editor} />

      <Divider />

      {/* Headings */}
      <MenuButton
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Subtítulo H2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </MenuButton>

      <MenuButton
        isActive={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Subtítulo H3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </MenuButton>

      <Divider />

      {/* AI actions */}
      <button
        onClick={() => onAiAction("expand")}
        disabled={!!aiLoading}
        title="Expandir seleção com IA"
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
          "text-primary transition-colors hover:bg-primary/10",
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {aiLoading === "expand" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        Expandir
      </button>

      <button
        onClick={() => onAiAction("rewrite")}
        disabled={!!aiLoading}
        title="Reescrever seleção com IA"
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
          "text-primary transition-colors hover:bg-primary/10",
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {aiLoading === "rewrite" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        Reescrever
      </button>
    </BubbleMenu>
  )
}
