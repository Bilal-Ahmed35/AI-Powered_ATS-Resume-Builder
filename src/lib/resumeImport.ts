import { ResumeData } from "@/types/resume";

// Minimal UID generator
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// Extract text from various file types
async function extractTextFromPdf(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");

  // Dynamically import the worker URL (Vite will emit it as an asset)
  const { default: workerUrl } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // @ts-ignore
    const strings = content.items.map((it: any) =>
      it && it.str ? it.str : "",
    );
    text += strings.join(" ") + "\n";
  }
  return text;
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.default.extractRawText({ arrayBuffer });
  return result.value as string;
}

async function extractTextFromTxt(file: File): Promise<string> {
  return file.text();
}

async function extractTextFromFile(file: File): Promise<string> {
  const type = file.type;
  const name = file.name.toLowerCase();

  try {
    if (type === "application/pdf" || name.endsWith(".pdf")) {
      return await extractTextFromPdf(file);
    }
    if (
      type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx")
    ) {
      return await extractTextFromDocx(file);
    }
    if (type === "text/plain" || name.endsWith(".txt")) {
      return await extractTextFromTxt(file);
    }
    if (type === "application/msword" || name.endsWith(".doc")) {
      throw new Error(
        "Legacy .doc files are not supported. Please upload PDF, DOCX, or TXT files for best results.",
      );
    }
    throw new Error(
      "Unsupported file type. Please upload PDF, DOCX, or TXT files.",
    );
  } catch (error) {
    // If specific extraction fails, provide helpful fallback message
    if (error instanceof Error && error.message.includes("worker")) {
      throw new Error(
        "PDF processing failed. For best results, try uploading a TXT or DOCX file instead.",
      );
    }
    throw error;
  }
}

// Simple heuristics-based parser to convert free text into ResumeData
function parseResumeTextToData(text: string): ResumeData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(
    /(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/,
  );
  const linkedInMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-_.]+/i,
  );

  // first non-empty line that isn't email/phone/url -> name candidate
  let fullName = "";
  for (const l of lines.slice(0, 6)) {
    if (
      !l.toLowerCase().includes("email") &&
      !l.toLowerCase().includes("phone") &&
      !/https?:\/\//i.test(l) &&
      !/@/.test(l) &&
      l.split(" ").length <= 6 // avoid full address lines
    ) {
      fullName = l;
      break;
    }
  }

  // portfolio: first url that isn't linkedin
  let portfolio = "";
  const urlMatches =
    text.match(/https?:\/\/[\w-._~:?#\[\]@!$&'()*+,;=/]+/gi) || [];
  const portfolioUrl = urlMatches.find((u) => !/linkedin\.com/i.test(u));
  if (portfolioUrl) portfolio = portfolioUrl;

  // Skills parsing - lines after a header containing \"skills\"
  const skillsIndex = lines.findIndex((l) => /\bskills\b/i.test(l));
  const technical: string[] = [];
  if (skillsIndex !== -1) {
    let i = skillsIndex + 1;
    const buff: string[] = [];
    while (i < lines.length && lines[i] && !/^\s*$/.test(lines[i])) {
      const stop = /experience|education|project|summary|profile/i.test(
        lines[i],
      );
      if (stop) break;
      buff.push(lines[i]);
      i++;
    }
    const merged = buff.join(", ");
    merged
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => technical.push(s));
  }

  // Education parsing - look for institution keywords and degree keywords
  const education = [] as ResumeData["education"];
  const degreeRegex =
    /\b(Bachelor|Master|B\.?Sc|M\.?Sc|B\.?Tech|M\.?Tech|B\.?E|M\.?E|BA|MA|Ph\.?D)\b/i;
  for (let i = 0; i < lines.length; i++) {
    if (/university|college|institute|school/i.test(lines[i])) {
      const inst = lines[i];
      // look around for degree/field
      let degree = "";
      let field = "";
      for (let j = i; j < Math.min(i + 4, lines.length); j++) {
        const m = lines[j].match(degreeRegex);
        if (m) {
          degree = m[0];
          const after = lines[j]
            .replace(degreeRegex, "")
            .replace(/^[,:-\s]+/, "");
          if (after) field = after;
          break;
        }
      }
      education.push({
        id: uid(),
        institution: inst,
        degree,
        field,
        startDate: "",
        endDate: "",
        gpa: undefined,
        achievements: [],
      });
    }
  }

  // Experience parsing - naive date range detection
  const workExperience = [] as ResumeData["workExperience"];
  const dateRange =
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\s?\d{4}\s?[–-]\s?(Present|Current|\d{4})/i;
  for (let i = 0; i < lines.length; i++) {
    if (dateRange.test(lines[i])) {
      const line = lines[i];
      const prev = lines[i - 1] || "";
      // Try to infer position and company from surrounding lines
      let position = prev;
      let company = "";
      if (/ at /i.test(prev)) {
        const [pos, comp] = prev.split(/ at /i);
        position = pos.trim();
        company = comp?.trim() || "";
      } else if (/ - /.test(prev)) {
        const [comp, pos] = prev.split(/ - /);
        company = comp.trim();
        position = pos?.trim() || position;
      }
      const dr = line.match(dateRange)?.[0] || "";
      const [startDate = "", endDateRaw = ""] = dr
        .split(/[–-]/)
        .map((s) => s.trim());
      const endDate = /present|current/i.test(endDateRaw)
        ? ""
        : normalizeDate(endDateRaw);
      workExperience.push({
        id: uid(),
        company,
        position,
        location: "",
        startDate: normalizeDate(startDate),
        endDate,
        current: /present|current/i.test(endDateRaw),
        responsibilities: [],
        achievements: [],
      });
    }
  }

  const data: ResumeData = {
    personalInfo: {
      fullName: fullName || "",
      email: emailMatch?.[0] || "",
      phone: phoneMatch?.[0] || "",
      address: "",
      linkedIn: linkedInMatch?.[0] || "",
      portfolio: portfolio || "",
    },
    education,
    workExperience,
    skills: {
      technical,
      soft: [],
      languages: [],
    },
    projects: [],
  };

  return data;
}

function normalizeDate(input: string): string {
  const s = input.trim();
  // Keep as-is if already YYYY or Mon YYYY
  if (/^\d{4}$/.test(s)) return `${s}-01`;
  const m = s.match(
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s?(\d{4})/i,
  );
  if (m) {
    const months: Record<string, string> = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      sept: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    const mm = months[m[1].toLowerCase()];
    return `${m[2]}-${mm}`;
  }
  return "";
}

export async function importResume(file: File): Promise<ResumeData> {
  const text = await extractTextFromFile(file);
  return parseResumeTextToData(text);
}
