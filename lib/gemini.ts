interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function askGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
      process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from Gemini');
    }

    const json: GeminiResponse = await response.json();

    if (!json.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini');
    }

    return json.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function geminiGenerateStudyPlan({
  subject,
  materials,
  timeFrame,
}: {
  subject: string;
  materials: { id: string; title: string; text: string }[];
  timeFrame: string;
}) {
  const prompt = `
You are an expert study planner AI.
Subject: ${subject}
Time frame: ${timeFrame}
Materials:
${materials.map((m, i) => `Material ${i + 1}: ${m.title}\n${m.text}`).join('\n\n')}

Generate a step-by-step study plan, with realistic goals for each material, in JSON format:
{
  "steps": [
    { "materialId": "...", "title": "...", "goal": "..." }
  ],
  "summary": "..."
}
`;

  const response = await askGemini(prompt);
  try {
    return JSON.parse(response);
  } catch {
    // fallback if Gemini returns non-JSON
    return { subject, timeFrame, steps: [], summary: response };
  }
}