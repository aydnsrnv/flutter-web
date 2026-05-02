import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobData, resumeData } = body;

    if (!jobData || !resumeData) {
      return NextResponse.json(
        { error: "jobData ve resumeData gerekli" },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key yapılandırılmamış" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(jobData, resumeData);

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Sen kapsamlı bir İK uzmanı ve yapay zeka kariyer danışmanısın. Sadece JSON formatında yanıt ver. Türkçe veya Azerice yanıt ver (kullanıcının diline göre).",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenAI API hatası: ${response.status}`, detail: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "OpenAI'dan boş yanıt alındı" },
        { status: 502 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "AI yanıtı JSON formatında değil", raw: content },
        { status: 502 }
      );
    }

    return NextResponse.json({
      score: clampScore(Number(parsed.score)),
      summary: String(parsed.summary ?? "").trim(),
      strengths: toArray(parsed.strengths),
      weaknesses: toArray(parsed.weaknesses),
      suggestions: toArray(parsed.suggestions),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}

function buildPrompt(jobData: any, resumeData: any) {
  return `Aşağıdaki vakansiya ile CV'yi detaylıca karşılaştır ve uyum analizi yap.

## VAKANSİYA
Başlık: ${jobData.title ?? "Belirtilmemiş"}
Şirket: ${jobData.company_name ?? "Belirtilmemiş"}
Tür: ${jobData.job_type ?? "Belirtilmemiş"}
Kategori: ${jobData.category_name ?? "Belirtilmemiş"}
Şehir: ${jobData.city ?? "Belirtilmemiş"}
Tecrübe: ${jobData.experience ?? "Belirtilmemiş"}
Eğitim: ${jobData.education ?? "Belirtilmemiş"}
Maaş: ${jobData.min_salary ?? ""} - ${jobData.max_salary ?? ""}
Cinsiyet: ${jobData.gender ?? "Belirtilmemiş"}
Yaş Aralığı: ${jobData.min_age ?? ""}-${jobData.max_age ?? ""}

Açıklama:
${jobData.about ?? "Belirtilmemiş"}

Gereksinimler:
${jobData.request ?? "Belirtilmemiş"}

## CV
İsim: ${resumeData.full_name ?? "Belirtilmemiş"}
Pozisyon: ${resumeData.desired_position ?? "Belirtilmemiş"}
Şehir: ${resumeData.city ?? "Belirtilmemiş"}
Eğitim: ${resumeData.education ?? "Belirtilmemiş"}
Tecrübe: ${resumeData.experience ?? "Belirtilmemiş"}
Maaş Beklentisi: ${resumeData.desired_salary ?? "Belirtilmemiş"}

Açıklama:
${resumeData.about ?? "Belirtilmemiş"}

## İSTENEN FORMAT (sadece JSON)
{
  "score": 85,
  "summary": "2-3 cümlelik genel değerlendirme",
  "strengths": ["madde 1", "madde 2", "madde 3"],
  "weaknesses": ["madde 1", "madde 2"],
  "suggestions": ["madde 1", "madde 2", "madde 3"]
}`;
}

function clampScore(n: number) {
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}
