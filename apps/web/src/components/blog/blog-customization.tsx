"use client";

import { useState } from "react";
import { Check, Paintbrush, Type, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const colors = [
  { id: "teal", value: "#14b8a6", name: "Verde-azulado" },
  { id: "blue", value: "#3b82f6", name: "Azul" },
  { id: "orange", value: "#f97316", name: "Laranja" },
  { id: "green", value: "#22c55e", name: "Verde" },
  { id: "gold", value: "#d97706", name: "Dourado" },
  { id: "red", value: "#dc2626", name: "Vermelho" },
];

const fonts = [
  { id: "inter", name: "Inter", style: "font-sans" },
  { id: "serif", name: "Serif", style: "font-serif" },
  { id: "mono", name: "Mono", style: "font-mono" },
];

export function BlogCustomization() {
  const [selectedColor, setSelectedColor] = useState("teal");
  const [selectedFont, setSelectedFont] = useState("inter");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Paintbrush className="h-5 w-5 text-primary" />
          Personalizacao
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Logo</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Adicione o logo da sua empresa para aparecer no topo do blog.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Enviar logo
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">PNG, JPG ou SVG. Maximo 2MB.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Cor principal</h3>
          <p className="mb-4 text-xs text-muted-foreground">Esta cor sera usada em botoes, links e destaques do seu blog.</p>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColor(color.id)}
                className={cn(
                  "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-transform hover:scale-105",
                  selectedColor === color.id && "ring-2 ring-offset-2",
                )}
                style={{ backgroundColor: color.value, outlineColor: color.value }}
                title={color.name}
              >
                {selectedColor === color.id ? <Check className="h-5 w-5 text-white" /> : null}
              </button>
            ))}
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Type className="h-4 w-4" />
            Tipografia
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">Escolha a fonte que sera usada nos textos do blog.</p>
          <div className="flex flex-wrap gap-3">
            {fonts.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => setSelectedFont(font.id)}
                className={cn(
                  "rounded-xl border-2 px-6 py-4 transition-all",
                  selectedFont === font.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  font.style,
                )}
              >
                <span className="text-lg">{font.name}</span>
                <p className="mt-1 text-xs text-muted-foreground">Aa Bb Cc</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <Button>Salvar alteracoes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
