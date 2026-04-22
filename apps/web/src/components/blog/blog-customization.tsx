"use client"

import { useActionState, useState } from "react"
import { saveBlogAppearance, type SiteState } from "@/app/app/blog/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check, Paintbrush, Type, Upload } from "lucide-react"

const colors = [
  { id: "teal", value: "#14b8a6", name: "Verde-azulado" },
  { id: "blue", value: "#3b82f6", name: "Azul" },
  { id: "orange", value: "#f97316", name: "Laranja" },
  { id: "green", value: "#22c55e", name: "Verde" },
  { id: "red", value: "#dc2626", name: "Vermelho" },
]

const fonts = [
  { id: "inter", name: "Inter", style: "font-sans" },
  { id: "serif", name: "Serif", style: "font-serif" },
  { id: "mono", name: "Mono", style: "font-mono" },
]

const initialState: SiteState = {}

type BlogCustomizationProps = {
  logoUrl?: string | null
  primaryColor: string
  fontFamily: string
}

export function BlogCustomization({
  logoUrl,
  primaryColor,
  fontFamily,
}: BlogCustomizationProps) {
  const [state, formAction, pending] = useActionState(saveBlogAppearance, initialState)
  const [selectedColor, setSelectedColor] = useState(primaryColor)
  const [selectedFont, setSelectedFont] = useState(fontFamily)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Paintbrush className="h-5 w-5 text-primary" />
          Personalizacao
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-8">
          <input type="hidden" name="primary_color" value={selectedColor} />
          <input type="hidden" name="font_family" value={selectedFont} />

          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">Logo</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Adicione o logo da sua empresa para aparecer no topo do blog.
            </p>
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo atual" className="h-full w-full object-contain p-2" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                  <Upload className="h-4 w-4" />
                  Enviar logo
                  <input name="logo" type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  PNG, JPG ou SVG. Maximo 2MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">Cor principal</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Esta cor sera usada em botoes, links e destaques do seu blog.
            </p>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-transform hover:scale-105",
                    selectedColor.toLowerCase() === color.value.toLowerCase() && "ring-2 ring-offset-2",
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor.toLowerCase() === color.value.toLowerCase() && (
                    <Check className="h-5 w-5 text-white" />
                  )}
                </button>
              ))}
              <input
                aria-label="Cor personalizada"
                type="color"
                value={selectedColor}
                onChange={(event) => setSelectedColor(event.target.value)}
                className="h-12 w-12 cursor-pointer rounded-xl border-2 border-dashed border-border bg-transparent p-1"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Type className="h-4 w-4" />
              Tipografia
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Escolha a fonte que sera usada nos textos do blog.
            </p>
            <div className="flex flex-wrap gap-3">
              {fonts.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setSelectedFont(font.id)}
                  className={cn(
                    "rounded-xl border-2 px-6 py-4 transition-all",
                    selectedFont === font.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    font.style,
                  )}
                >
                  <span className="text-lg">{font.name}</span>
                  <p className="mt-1 text-xs text-muted-foreground">Aa Bb Cc</p>
                </button>
              ))}
            </div>
          </div>

          {(state.error || state.success) && (
            <p className={cn("text-sm", state.error ? "text-destructive" : "text-green-700")}>
              {state.error || state.success}
            </p>
          )}

          <div className="flex justify-end border-t border-border pt-6">
            <Button disabled={pending}>{pending ? "Salvando..." : "Salvar alteracoes"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
