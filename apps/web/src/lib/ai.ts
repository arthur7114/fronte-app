
type OpenAiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function callOpenAiJson<T>({
  messages,
  schemaHint,
  model = "gpt-4o",
}: {
  messages: OpenAiMessage[];
  schemaHint: string;
  model?: string;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a Brazilian Portuguese business strategy assistant specialized in SEO and content operations. Return valid JSON only.",
        },
        ...messages,
        {
          role: "user",
          content: `Return JSON matching this shape: ${schemaHint}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  const payload = (await response.json()) as OpenAiResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "OpenAI request failed.");
  }

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return JSON.parse(content) as T;
}
