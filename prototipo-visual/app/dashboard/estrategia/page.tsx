import { StrategyChatInterface } from "@/components/strategy/strategy-chat"
import { StrategySidebar } from "@/components/strategy/strategy-sidebar"

export default function EstrategiaPage() {
  return (
    <div className="flex gap-6">
      {/* Main Chat Area */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Estratégia de Conteúdo
          </h1>
          <p className="mt-1 text-muted-foreground">
            Conte-nos sobre seu negócio para criarmos uma estratégia personalizada.
          </p>
        </div>
        <StrategyChatInterface />
      </div>

      {/* Strategy Summary Sidebar */}
      <div className="w-80 shrink-0">
        <StrategySidebar />
      </div>
    </div>
  )
}
