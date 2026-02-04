import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const text = await req.text(); // read raw body first
    console.log("RAW BODY:", text);

    let body: any = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body", raw: text },
        { status: 400 }
      );
    }

    console.log("PARSED BODY:", body);

    // Minimal required field check (only destination for now)
    const destination = String(body.destination || "").trim();
    if (!destination) {
      return NextResponse.json(
        { ok: false, error: "Missing destination" },
        { status: 400 }
      );
    }

    // Return something valid so frontend can render
    const itinerary = {
      destination,
      summary: {
        vibe: "debug trip",
        tips: ["API is receiving your payload ✅"],
        estTotalCost: Number(body.budget) || 0,
      },
      days: [
        {
          day: 1,
          dateLabel: body.startDate || "Day 1",
          blocks: [
            {
              timeOfDay: "Morning",
              title: "Test block",
              description: "If you see this, the POST worked.",
              estCost: 10,
              mapQuery: `${destination} center`,
            },
          ],
        },
      ],
    };

    return NextResponse.json(itinerary);
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown server error" },
      { status: 400 }
    );
  }
}
