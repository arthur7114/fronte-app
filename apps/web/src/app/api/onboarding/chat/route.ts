import { NextResponse } from "next/server";
import { callOpenAiJson } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `Você é um especialista em estratégia de conteúdo pragmático e solícito.
Seu objetivo é guiar o usuário na configuração inicial do negócio dele dentro da plataforma Fronte.

CONTEXTO ATUAL DO PROJETO:
- Nome: ${context.tenantName}
- Site: ${context.siteName}
- Subdomínio: ${context.subdomain}.fronte.app

DADOS QUE VOCÊ PRECISA COLETAR (BRIEFING):
1. Segmento (ex: SaaS de finanças, Advocacia trabalhista)
2. O que vende (Ofertas/Serviços)
3. Perfil de cliente (ICP/Buyer Persona)
4. Localização (onde o negócio atua)
5. Palavras-chave que o cliente gostaria de rankear
6. Principais concorrentes

SUA MISSÃO:
- Seja amigável, direto e profissional.
- Pergunte uma coisa de cada vez.
- Se o usuário der uma resposta curta, tente extrair mais detalhes ou sugira como aquilo pode ser melhorado.
- Mantenha o foco em coletar os 6 pontos acima.

RETORNE SEMPRE UM JSON NO SEGUINTE FORMATO:
{
  "message": "Sua resposta amigável para o usuário aqui",
  "data": {
    "segment": "...", 
    "offerings": "...",
    "customer_profile": "...",
    "location": "...",
    "desired_keywords": ["...", "..."],
    "competitors": ["...", "..."]
  },
  "is_complete": false // Marque como true quando tiver coletado o suficiente de cada ponto
}`;

    const result = await callOpenAiJson({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      schemaHint: '{ "message": "string", "data": { ... }, "is_complete": boolean }'
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Onboarding chat error:", error);
    return NextResponse.json({ error: "Erro na comunicação com a IA" }, { status: 500 });
  }
}
