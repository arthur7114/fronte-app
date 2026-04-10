export function parseBriefingList(input: string) {
  return input
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);
}

export function stringifyBriefingList(values: string[] | null | undefined) {
  return (values ?? []).join(", ");
}

function normalizeOptionalText(input: string) {
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function buildBusinessBriefingSummary(input: {
  businessName: string;
  segment: string;
  offerings: string;
  customerProfile: string;
  location: string | null;
  desiredKeywords: string[];
  competitors: string[];
}) {
  const parts = [
    `${input.businessName} atua em ${input.segment}.`,
    `Oferta principal: ${input.offerings}.`,
    `Cliente ideal: ${input.customerProfile}.`,
  ];

  if (input.location) {
    parts.push(`Contexto geografico: ${input.location}.`);
  }

  if (input.desiredKeywords.length > 0) {
    parts.push(`Palavras iniciais: ${input.desiredKeywords.join(", ")}.`);
  }

  if (input.competitors.length > 0) {
    parts.push(`Concorrentes citados: ${input.competitors.join(", ")}.`);
  }

  return parts.join(" ");
}

export function validateBusinessBriefingInput(formData: FormData) {
  const businessName = String(formData.get("business_name") ?? "").trim();
  const segment = String(formData.get("segment") ?? "").trim();
  const offerings = String(formData.get("offerings") ?? "").trim();
  const customerProfile = String(formData.get("customer_profile") ?? "").trim();
  const location = normalizeOptionalText(String(formData.get("location") ?? ""));
  const desiredKeywords = parseBriefingList(String(formData.get("desired_keywords") ?? ""));
  const keywordMotivation = normalizeOptionalText(
    String(formData.get("keyword_motivation") ?? ""),
  );
  const competitors = parseBriefingList(String(formData.get("competitors") ?? ""));
  const notes = normalizeOptionalText(String(formData.get("notes") ?? ""));

  if (businessName.length < 2) {
    return {
      ok: false as const,
      error: "Informe o nome do negocio com pelo menos 2 caracteres.",
    };
  }

  if (segment.length < 3) {
    return {
      ok: false as const,
      error: "Informe o segmento do negocio com pelo menos 3 caracteres.",
    };
  }

  if (offerings.length < 10) {
    return {
      ok: false as const,
      error: "Descreva os servicos ou produtos com um pouco mais de contexto.",
    };
  }

  if (customerProfile.length < 10) {
    return {
      ok: false as const,
      error: "Descreva o perfil de cliente com um pouco mais de contexto.",
    };
  }

  return {
    ok: true as const,
    value: {
      businessName,
      segment,
      offerings,
      customerProfile,
      location,
      desiredKeywords,
      keywordMotivation,
      competitors,
      notes,
      summary: buildBusinessBriefingSummary({
        businessName,
        segment,
        offerings,
        customerProfile,
        location,
        desiredKeywords,
        competitors,
      }),
    },
  };
}
