import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type TimeBlock = {
  timeOfDay: "Morning" | "Afternoon" | "Evening";
  title: string;
  description: string;
  estCost: number;
  mapQuery: string;
};

type ItineraryDay = {
  day: number;
  dateLabel: string;
  blocks: TimeBlock[];
};

type Itinerary = {
  destination: string;
  summary: {
    vibe: string;
    tips: string[];
    estTotalCost: number;
  };
  days: ItineraryDay[];
};

function numDaysInclusive(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 4;
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function dateLabelForDay(start: string, dayIndex: number) {
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return `Day ${dayIndex + 1}`;
  const d = new Date(s);
  d.setDate(s.getDate() + dayIndex);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const destination = String(body.destination || "").trim();
    const startDate = String(body.startDate || "").trim();
    const endDate = String(body.endDate || "").trim();
    const travelers = Number(body.travelers || 1);
    const budget =
      body.budget === "" || body.budget == null ? null : Number(body.budget);
    const interests = Array.isArray(body.interests) ? body.interests.map(String) : [];

    if (!destination) {
      return NextResponse.json({ error: "Destination is required" }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end date are required" },
        { status: 400 }
      );
    }

    const daysCount = numDaysInclusive(startDate, endDate);
    const dateLabels = Array.from({ length: daysCount }).map((_, i) =>
      dateLabelForDay(startDate, i)
    );

    const system = [
      "You are an expert travel planner.",
      "Return ONLY valid JSON (no markdown, no extra text).",
      "The JSON must match EXACTLY this TypeScript shape:",
      `{
        "destination": string,
        "summary": { "vibe": string, "tips": string[], "estTotalCost": number },
        "days": Array<{
          "day": number,
          "dateLabel": string,
          "blocks": Array<{
            "timeOfDay": "Morning" | "Afternoon" | "Evening",
            "title": string,
            "description": string,
            "estCost": number,
            "mapQuery": string
          }>
        }>
      }`,
      "Rules:",
      `- There must be exactly ${daysCount} days.`,
      `- Use these dateLabel values exactly: ${JSON.stringify(dateLabels)}.`,
      "- Each day must have exactly 3 blocks: Morning, Afternoon, Evening (in that order).",
      "- Titles should be short; descriptions 1–2 sentences.",
      "- Make mapQuery specific for Google Maps (place + city + neighborhood/landmark).",
      "- Keep activities feasible and safe.",
    ].join("\n");

    const user = {
      destination,
      startDate,
      endDate,
      daysCount,
      dateLabels,
      travelers,
      budget,
      interests,
    };

    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      temperature: 0.6,

      // Responses API
      text: {
        format: {
          type: "json_object",
        },
      },

      input: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) },
      ],
    });

    const raw = resp.output_text;
    if (!raw) {
      return NextResponse.json({ error: "No response from model" }, { status: 500 });
    }

    // Parse JSON safely
    let itinerary: Itinerary;
    try {
      itinerary = JSON.parse(raw) as Itinerary;
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON", raw },
        { status: 500 }
      );
    }

    // Guardrails: enforce counts + date labels
    itinerary.destination = destination;
    itinerary.days = (itinerary.days || []).slice(0, daysCount).map((d, idx) => ({
      ...d,
      day: idx + 1,
      dateLabel: dateLabels[idx],
      blocks: (d.blocks || []).slice(0, 3),
    }));

    return NextResponse.json(itinerary);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error generating itinerary" }, { status: 500 });
  }
}
