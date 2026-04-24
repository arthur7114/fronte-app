"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"
import { Extension } from "@tiptap/core"
import type { Editor, Range } from "@tiptap/core"
import { ReactRenderer } from "@tiptap/react"
import Suggestion from "@tiptap/suggestion"
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion"
import tippy from "tippy.js"
import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Image,
  List,
  ListOrdered,
  Minus,
  Quote,
  Sparkles,
  Table,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SlashCommandItem = {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  keywords: string[]
  command: (args: { editor: Editor; range: Range }) => void
}

type SlashMenuRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

// ---------------------------------------------------------------------------
// AI inline generation (called from /ia command)
// ---------------------------------------------------------------------------

async function handleAiGenerate(editor: Editor, instruction: string) {
  const placeholder = "<p><em>✦ Gerando conteúdo...</em></p>"
  editor.commands.insertContent(placeholder)

  try {
    const res = await fetch("/api/editor-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "continue", content: instruction }),
    })
    const data = await res.json()
    const html = editor.getHTML().replace(placeholder, "")
    editor.commands.setContent(html, { emitUpdate: false })
    if (data.text) editor.commands.insertContent(`<p>${data.text}</p>`)
  } catch {
    const html = editor.getHTML().replace(placeholder, "")
    editor.commands.setContent(html, { emitUpdate: false })
  }
}

// ---------------------------------------------------------------------------
// Command list
// ---------------------------------------------------------------------------

const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: "Título",
    description: "Título principal da seção (H1)",
    icon: Heading1,
    keywords: ["titulo", "h1", "heading", "title"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Subtítulo",
    description: "Subtítulo de seção (H2)",
    icon: Heading2,
    keywords: ["subtitulo", "h2", "heading2"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Subtítulo menor",
    description: "Subtítulo menor (H3)",
    icon: Heading3,
    keywords: ["subtitulo menor", "h3", "heading3"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Lista",
    description: "Lista com marcadores",
    icon: List,
    keywords: ["lista", "bullet", "ul", "list"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Lista numerada",
    description: "Lista com numeração",
    icon: ListOrdered,
    keywords: ["lista numerada", "ol", "numbered", "ordered"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Citação",
    description: "Bloco de citação destacado",
    icon: Quote,
    keywords: ["citacao", "quote", "blockquote"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Código",
    description: "Bloco de código com syntax highlight",
    icon: Code2,
    keywords: ["codigo", "code", "codeblock", "snippet"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Tabela",
    description: "Inserir tabela 3×3",
    icon: Table,
    keywords: ["tabela", "table", "grid"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: "Imagem",
    description: "Inserir imagem por URL",
    icon: Image,
    keywords: ["imagem", "image", "foto", "picture"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const url = window.prompt("URL da imagem:")
      if (url?.trim()) {
        editor.chain().focus().setImage({ src: url.trim() }).run()
      }
    },
  },
  {
    title: "Divisor",
    description: "Linha horizontal separadora",
    icon: Minus,
    keywords: ["divisor", "hr", "separador", "linha"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "IA ✦",
    description: "Gerar conteúdo com inteligência artificial",
    icon: Sparkles,
    keywords: ["ia", "ai", "gerar", "inteligencia", "artificial"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const instruction = window.prompt(
        "Instrução para a IA (ex: escreva um parágrafo sobre benefícios do SEO local):",
      )
      if (instruction?.trim()) {
        void handleAiGenerate(editor, instruction.trim())
      }
    },
  },
]

// ---------------------------------------------------------------------------
// Slash Menu React component (rendered via ReactRenderer + tippy)
// ---------------------------------------------------------------------------

const SlashMenu = forwardRef<
  SlashMenuRef,
  { items: SlashCommandItem[]; command: (item: SlashCommandItem) => void }
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback(
    (index: number) => {
      const item = props.items[index]
      if (item) props.command(item)
    },
    [props],
  )

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((i) => (i + props.items.length - 1) % props.items.length)
        return true
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((i) => (i + 1) % props.items.length)
        return true
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  if (!props.items.length) {
    return (
      <div className="z-50 w-64 overflow-hidden rounded-lg border border-border bg-popover p-2 shadow-lg">
        <p className="px-2 py-1 text-xs text-muted-foreground">Nenhum resultado</p>
      </div>
    )
  }

  return (
    <div className="z-50 max-h-80 w-64 overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg">
      {props.items.map((item, index) => (
        <button
          key={item.title}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
            index === selectedIndex
              ? "bg-accent text-accent-foreground"
              : "text-foreground hover:bg-muted",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <item.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium leading-none">{item.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
})
SlashMenu.displayName = "SlashMenu"

// ---------------------------------------------------------------------------
// Tiptap Extension
// ---------------------------------------------------------------------------

export const SlashCommandExtension = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: SlashCommandItem
        }) => {
          props.command({ editor, range })
        },
        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase()
          if (!q) return SLASH_COMMANDS
          return SLASH_COMMANDS.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.keywords.some((kw) => kw.includes(q)),
          ).slice(0, 10)
        },
        render: () => {
          let component: ReactRenderer
          let popup: ReturnType<typeof tippy>

          return {
            onStart: (props: SuggestionProps<SlashCommandItem>) => {
              component = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) return

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                animation: "shift-away",
                theme: "none",
              })
            },

            onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
              component.updateProps(props)
              if (props.clientRect) {
                popup[0]?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                })
              }
            },

            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === "Escape") {
                popup[0]?.hide()
                return true
              }
              return (component.ref as SlashMenuRef | null)?.onKeyDown(props) ?? false
            },

            onExit: () => {
              popup?.[0]?.destroy()
              component?.destroy()
            },
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
