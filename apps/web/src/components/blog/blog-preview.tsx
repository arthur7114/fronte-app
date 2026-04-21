"use client";

import { useState } from "react";
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceWidths = {
  desktop: "w-full",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

export function BlogPreview() {
  const [device, setDevice] = useState<DeviceType>("desktop");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Visualizacao do Blog</h2>
            <p className="text-sm text-muted-foreground">Veja como seu blog aparece para os visitantes</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border border-border p-1">
              {[
                { value: "desktop" as const, icon: Monitor },
                { value: "tablet" as const, icon: Tablet },
                { value: "mobile" as const, icon: Smartphone },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDevice(item.value)}
                  className={cn(
                    "rounded-md p-2 transition-colors",
                    device === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir blog
            </Button>
          </div>
        </div>

        <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-6">
          <div className={cn("overflow-hidden rounded-lg border border-border bg-white shadow-lg transition-all", deviceWidths[device])}>
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-xs text-muted-foreground">
                clinicadental.com.br/blog
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary" />
                  <span className="font-semibold text-foreground">Clinica Dental</span>
                </div>
                <div className="hidden gap-4 text-sm text-muted-foreground sm:flex">
                  <span>Inicio</span>
                  <span>Servicos</span>
                  <span className="font-medium text-primary">Blog</span>
                  <span>Contato</span>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-xs font-medium uppercase tracking-wider text-primary">Saude Bucal</span>
                <h3 className="mt-2 text-xl font-bold text-foreground">10 Dicas para Cuidar dos Dentes em Casa</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Descubra como manter seus dentes saudaveis com praticas simples do dia a dia...
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {["Clareamento Dental: Vale a Pena?", "Quanto Custa um Implante?"].map((title) => (
                  <div key={title} className="rounded-lg border border-border p-3">
                    <div className="h-20 rounded-md bg-muted" />
                    <p className="mt-2 text-xs font-medium text-foreground">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">3 min de leitura</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
