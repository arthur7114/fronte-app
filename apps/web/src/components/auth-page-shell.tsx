import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { TrendingUp, FileText, BarChart3 } from "lucide-react";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  children: ReactNode;
};

export function AuthPageShell({ eyebrow, title, description, note, children }: AuthPageShellProps) {
  return (
    <main className="min-h-screen flex bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Left Side - Login Form Area */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12">
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-left-4 duration-700">
          {/* Logo (Using existing Super BrandMark) */}
          <div className="mb-12">
            <BrandMark />
          </div>

          {/* Form Content */}
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="text-slate-500 font-medium">
              {description}
            </p>
          </div>

          <div className="relative">
            {children}
          </div>

          {/* Minimal Footnote */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-[10px] leading-relaxed text-slate-400 font-bold uppercase tracking-widest text-center">
              {note}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding & Social Proof (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 bg-slate-50 items-center justify-center p-12 relative overflow-hidden border-l border-slate-100">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-teal-100 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.03]" />
        </div>

        <div className="relative z-10 max-w-lg text-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          {/* Feature Cards from User Reference */}
          <div className="space-y-4 mb-12">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm text-left transform transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 tracking-tight">+300% em tráfego orgânico</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Aumente suas visitas com conteúdo otimizado para SEO e GEO de última geração.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm text-left transform transition-transform hover:scale-[1.02] duration-300 delay-75">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                  <FileText className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 tracking-tight">Escala Editorial</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Nossa IA cria artigos completos e otimizados automaticamente em minutos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm text-left transform transition-transform hover:scale-[1.02] duration-300 delay-150">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 tracking-tightResultados Mensuráveis">Dados Transparentes</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Acompanhe o crescimento da sua estratégia com analytics simplificados e acionáveis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl text-left">
            <p className="text-slate-100 italic leading-relaxed text-lg">
              &quot;Em 3 meses triplicamos nosso tráfego orgânico. A plataforma faz todo o trabalho pesado de SEO.&quot;
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-black text-xs">
                MR
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">Maria Ribeiro</p>
                <p className="text-xs text-slate-400 font-medium">Clínica Bem Estar</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
            Super &copy; 2026 / Inteligência Editorial em Escala
          </div>
        </div>
      </div>
    </main>
  );
}
