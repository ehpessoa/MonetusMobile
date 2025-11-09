import { GoogleGenAI, Type, Schema } from "@google/genai";

const GEMINI_MODEL = 'gemini-2.5-flash';

interface ParsedReceipt {
  total: number | null;
  date: string | null;
  merchant: string | null;
  categorySuggestion: string | null;
  description: string | null;
}

export const scanReceiptWithGemini = async (base64Image: string): Promise<ParsedReceipt> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Chave de API não encontrada.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        total: { type: Type.NUMBER, description: "O valor total da transação encontrado no recibo." },
        date: { type: Type.STRING, description: "A data da transação no formato ISO 8601 (AAAA-MM-DD) se encontrada, caso contrário null." },
        merchant: { type: Type.STRING, description: "O nome do estabelecimento ou comerciante." },
        description: { type: Type.STRING, description: "Uma descrição curta e concisa dos principais itens comprados, em Português." },
        categorySuggestion: {
          type: Type.STRING,
          description: "Uma sugestão de categoria para finanças pessoais, em Português.",
          enum: ['Mercado', 'Restaurantes', 'Farmácia', 'Combustível', 'Transporte', 'Lazer Geral', 'Outras Despesas']
        }
      },
      required: ["total", "merchant"],
    };

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analise este comprovante/recibo. Extraia o valor total, data, nome do estabelecimento e forneça uma breve descrição dos itens. Sugira também a categoria mais apropriada em Português."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do Gemini");

    return JSON.parse(text) as ParsedReceipt;

  } catch (error) {
    console.error("Erro na leitura do recibo com Gemini:", error);
    throw error;
  }
};
