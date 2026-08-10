import { GoogleGenAI } from "@google/genai";
import { ResumeData } from "@/types/resume";

const STORAGE_KEY = "gemini_api_key";

// Use a model that is available for your API key.
// Your models list showed Gemini 3.5 Flash with generateContent support.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

/**
 * Get the Gemini API key.
 *
 * Priority:
 * 1. User-provided key from localStorage
 * 2. VITE_GEMINI_API_KEY from environment variables
 */
export function getApiKey(): string {
  const storedKey = localStorage.getItem(STORAGE_KEY);

  if (storedKey && storedKey.trim().length > 0) {
    return storedKey.trim();
  }

  const envKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  return "";
}

/**
 * Save Gemini API key to localStorage.
 */
export function setApiKey(key: string): void {
  if (key && key.trim().length > 0) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Create a Gemini client.
 */
function getGeminiClient(): GoogleGenAI {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      "Google Gemini API key is missing. Please enter your API key in AI Settings or configure VITE_GEMINI_API_KEY.",
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

/**
 * Clean JSON returned by Gemini.
 *
 * Gemini may sometimes return:
 *
 * ```json
 * [...]
 * ```
 *
 * This removes the markdown code fences.
 */
function cleanJsonResponse(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * 1. Generate ATS-Optimized Work Experience Bullet Points
 */
export async function generateBulletPoints(
  jobTitle: string,
  company?: string,
  rawDuties?: string,
): Promise<string[]> {
  const genAI = getGeminiClient();

  const prompt = `You are an expert ATS (Applicant Tracking System) resume consultant.

Generate 4 impactful, high-scoring resume bullet points for the position of "${jobTitle}"${
    company ? ` at ${company}` : ""
  }.

${rawDuties ? `Base the points on these raw duties/notes: "${rawDuties}".` : ""}

Rules:

1. Start each bullet point with a strong, active verb such as Developed, Orchestrated, Engineered, Accelerated, Implemented, Designed, or Optimized.
2. Include realistic metrics or percentages where applicable.
3. Keep each bullet concise, professional, and optimized for ATS keywords.
4. Do not invent highly specific achievements that are not reasonably supported by the provided information.
5. Return ONLY a JSON array of strings.

Example:
["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"]`;

  const result = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const text = result.text?.trim() || "";

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    const cleanedJson = cleanJsonResponse(text);
    const parsed = JSON.parse(cleanedJson);

    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch (error) {
    console.warn(
      "Gemini returned non-JSON bullet points. Using fallback parser.",
      error,
    );

    const fallback = text
      .split("\n")
      .map((line) =>
        line
          .replace(/^[-*•]\s*/, "")
          .replace(/^\d+[.)]\s*/, "")
          .trim(),
      )
      .filter((line) => line.length > 10);

    if (fallback.length > 0) {
      return fallback;
    }
  }

  return [text];
}

/**
 * 2. Generate Professional Profile Summary
 */
export async function generateProfessionalSummary(
  fullName: string,
  targetRole: string,
  skills: string[],
  experienceLevel: "student" | "professional" = "professional",
): Promise<string> {
  const genAI = getGeminiClient();

  const prompt = `You are a professional executive resume writer.

Write a powerful 3-4 sentence professional summary for ${
    fullName || "a candidate"
  } targeting a "${targetRole}" position.

Experience level: ${experienceLevel}.

Key skills to highlight:
${skills.join(", ") || "software engineering, leadership, problem solving"}

Rules:

1. Make it compelling, modern, and ATS-optimized.
2. Focus on value proposition, technical expertise, and career accomplishments.
3. Avoid generic buzzwords and unnecessary fluff.
4. Do not invent specific companies, achievements, years of experience, or metrics.
5. Return ONLY the plain text of the summary.
6. Do not include a title, quotation marks, markdown, or bullet points.`;

  const result = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const text = result.text?.trim() || "";

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text.replace(/^["']|["']$/g, "").trim();
}

/**
 * 3. Recommend Relevant Skills for a Role
 */
export async function suggestSkillsForRole(role: string): Promise<{
  technical: string[];
  soft: string[];
}> {
  const genAI = getGeminiClient();

  const prompt = `As an expert technical recruiter, recommend the top in-demand skills for a candidate applying for the role of "${role}".

Return ONLY a valid JSON object matching this structure:

{
  "technical": [
    "Skill 1",
    "Skill 2",
    "Skill 3",
    "Skill 4",
    "Skill 5",
    "Skill 6"
  ],
  "soft": [
    "Skill 1",
    "Skill 2",
    "Skill 3",
    "Skill 4"
  ]
}

Rules:
1. Focus on skills genuinely relevant to the specified role.
2. Prioritize skills commonly requested by employers.
3. Do not include explanations.
4. Return valid JSON only.`;

  const result = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const text = result.text?.trim() || "";

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    const cleanedJson = cleanJsonResponse(text);
    const parsed = JSON.parse(cleanedJson);

    if (
      parsed &&
      Array.isArray(parsed.technical) &&
      Array.isArray(parsed.soft)
    ) {
      return {
        technical: parsed.technical.filter(
          (skill: unknown): skill is string => typeof skill === "string",
        ),
        soft: parsed.soft.filter(
          (skill: unknown): skill is string => typeof skill === "string",
        ),
      };
    }
  } catch (error) {
    console.error("Error parsing skills response from Gemini:", error);
  }

  // Fallback
  return {
    technical: [
      "Problem Solving",
      "Data Analysis",
      "System Design",
      "Git",
      "API Integration",
    ],
    soft: [
      "Communication",
      "Team Collaboration",
      "Critical Thinking",
      "Adaptability",
    ],
  };
}

/**
 * 4. Enhance / Parse Resume Text using AI
 */
export async function enhanceResumeWithAI(
  rawText: string,
): Promise<Partial<ResumeData>> {
  const genAI = getGeminiClient();

  const prompt = `Extract and structure the following raw resume text into JSON for an ATS resume builder.

Raw Resume Text:
"""
${rawText.slice(0, 4000)}
"""

Return ONLY a JSON object matching this structure:

{
  "personalInfo": {
    "fullName": "Name",
    "email": "Email",
    "phone": "Phone",
    "linkedIn": "LinkedIn URL",
    "portfolio": "Portfolio URL"
  },
  "workExperience": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or present",
      "responsibilities": [
        "Bullet 1",
        "Bullet 2"
      ]
    }
  ],
  "education": [
    {
      "institution": "University/School",
      "degree": "Degree",
      "field": "Field of Study"
    }
  ],
  "skills": {
    "technical": [
      "Skill 1",
      "Skill 2"
    ],
    "soft": [
      "Skill 1"
    ]
  }
}

Rules:

1. Extract only information supported by the resume text.
2. Do not invent missing personal information.
3. Preserve dates when they are available.
4. Convert work responsibilities into concise resume bullet points.
5. Return valid JSON only.
6. Do not wrap the JSON in markdown code fences.`;

  const result = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const text = result.text?.trim() || "";

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    const cleanedJson = cleanJsonResponse(text);

    return JSON.parse(cleanedJson) as Partial<ResumeData>;
  } catch (error) {
    console.error("Error parsing resume JSON from Gemini:", error);

    throw new Error(
      "Gemini returned an invalid resume structure. Please try uploading the resume again.",
    );
  }
}
