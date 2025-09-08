import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await request.json()

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Use MyMemory API - free translation service
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Translation service unavailable")
    }

    const data = await response.json()

    if (data.responseStatus !== 200) {
      throw new Error("Translation failed")
    }

    return NextResponse.json({
      translatedText: data.responseData.translatedText,
      sourceText: text,
      sourceLang,
      targetLang,
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Translation failed. Please try again." }, { status: 500 })
  }
}
