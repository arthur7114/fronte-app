
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { callOpenAiJson } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { tenant } = await getAuthContext();

    if (!tenant) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currentStep, data } = body;

    let prompt = "";
    let schemaHint = "";

    if (currentStep === "business_info") {
      prompt = `Com base no nome da empresa "${data.business_name}" e no segmento "${data.segment}", sugira uma descrição de produtos/serviços e perfil de cliente ideal (ICP).`;
      schemaHint = '{ "offerings": "string", "customer_profile": "string" }';
    } else if (currentStep === "strategy") {
      prompt = `Com base nos produtos/serviços "${data.offerings}" e no perfil de cliente "${data.customer_profile}", sugira 5-10 palavras-chave ideais e 3 principais concorrentes de mercado.`;
      schemaHint = '{ "desired_keywords": ["string"], "competitors": ["string"] }';
    } else {
      return new NextResponse("Invalid step", { status: 400 });
    }

    const suggestion = await callOpenAiJson({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      schemaHint,
    });

    return NextResponse.json(suggestion);
  } catch (error: any) {
    console.error("[BRIEFING_SUGGEST_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
