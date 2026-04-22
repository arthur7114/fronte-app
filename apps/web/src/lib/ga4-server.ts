import { BetaAnalyticsDataClient } from '@google-analytics/data';

/**
 * Cliente instanciado da Google Analytics Data API.
 * Usa as credenciais do Service Account Mestre configuradas no ambiente.
 */
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

try {
  if (process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        // É importante converter \n literal para quebra de linha real se estiver stringificado no .env
        private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  }
} catch (error) {
  console.error('[GA4] Failed to initialize Analytics Data Client:', error);
}

export type GA4TrafficResult = {
  dimension: string; // Ex: 'chatgpt', 'perplexity', 'claude'
  sessions: number;
};

/**
 * Busca os dados de tráfego (GEO) de IAs do GA4 Mestre,
 * filtrando por Tenant ID e agrupando pelas fontes reconhecidas.
 */
export async function getGeoTrafficFromGA4(
  tenantId: string,
  startDate = '30daysAgo',
  endDate = 'today'
): Promise<GA4TrafficResult[]> {
  const propertyId = process.env.GA_PROPERTY_ID;
  
  // Se não houver credenciais configuradas, falha silenciosamente (mock ou vazio)
  if (!analyticsDataClient || !propertyId) {
    console.warn(`[GA4] Missing credentials or property ID. Skipping GA4 fetch for tenant ${tenantId}.`);
    return [];
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        {
          name: 'sessionSource',
        },
      ],
      metrics: [
        {
          name: 'sessions',
        },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'customEvent:tenant_id',
          stringFilter: {
            value: tenantId,
            matchType: 'EXACT',
          },
        },
      },
    });

    if (!response.rows) {
      return [];
    }

    const trafficMap: Record<string, number> = {
      chatgpt: 0,
      perplexity: 0,
      claude: 0,
      gemini: 0,
      outros: 0,
    };

    response.rows.forEach((row) => {
      const source = row.dimensionValues?.[0]?.value?.toLowerCase() || '';
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);

      if (source.includes('chatgpt') || source.includes('openai')) {
        trafficMap.chatgpt += sessions;
      } else if (source.includes('perplexity')) {
        trafficMap.perplexity += sessions;
      } else if (source.includes('claude') || source.includes('anthropic')) {
        trafficMap.claude += sessions;
      } else if (source.includes('gemini') || source.includes('google')) {
        // Cuidado com google organic, mas focado em gemini
        if (source.includes('gemini')) trafficMap.gemini += sessions;
      } else if (source.match(/ai|bot|assistant/i)) {
         trafficMap.outros += sessions;
      }
    });

    // Retorna array formatado para a UI
    return Object.entries(trafficMap)
      .filter(([_, count]) => count > 0)
      .map(([dimension, sessions]) => ({
        dimension,
        sessions,
      }));

  } catch (error) {
    console.error(`[GA4] Error fetching data for tenant ${tenantId}:`, error);
    return [];
  }
}
