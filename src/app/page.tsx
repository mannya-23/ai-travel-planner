"use client";

import { useState } from "react";

const INTEREST_OPTIONS = ["Food", "Museums", "Nature", "Nightlife", "Shopping", "History"] as const;

type TimeBlock = {
  timeOfDay: "Morning" | "Afternoon" | "Evening";
  title: string;
  description: string;
  estCost: number; // per person estimate
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

export default function Home() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState<number | "">("");
  const [travelers, setTravelers] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((x) => x !== interest) : [...prev, interest]
    );
  };

  const onGenerate = async () => {
    setIsLoading(true);
    try {
      const payload = { destination, startDate, endDate, budget, travelers, interests };

      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!destination.trim()) {
        alert("Please enter a destination.");
        return;
      }

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = (await res.json()) as Itinerary;

      console.log("API response:", data);
      setItinerary(data);
    } catch (err) {
      console.error(err);
      alert("API call failed — check console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">AI Travel Planner</h1>
          <p className="mt-2 text-zinc-400">
            Generate a structured itinerary from your dates, budget, and interests.
          </p>
        </header>

        {/* FORM */}
        <section className="rounded-2xl bg-zinc-900/60 p-6 shadow">
          <h2 className="text-lg font-medium">Trip details</h2>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-sm text-zinc-300">Destination</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
                placeholder="e.g., Tokyo"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Budget (USD)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
                  placeholder="e.g., 1500"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Travelers</label>
                <input
                  type="number"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-300">Interests</label>

              <div className="mt-2 flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((x) => {
                  const selected = interests.includes(x);
                  return (
                    <button
                      key={x}
                      type="button"
                      onClick={() => toggleInterest(x)}
                      className={[
                        "rounded-full border px-3 py-1 text-sm transition",
                        selected
                          ? "border-zinc-200 bg-zinc-100 text-zinc-900"
                          : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-600",
                      ].join(" ")}
                    >
                      {x}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Selected: {interests.length ? interests.join(", ") : "None"}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-2 flex gap-3">
              <button
                className="rounded-xl bg-zinc-100 px-4 py-2 font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
                type="button"
                onClick={onGenerate}
                disabled={isLoading || !destination.trim()}

              >
                {isLoading ? "Generating..." : "Generate itinerary"}
              </button>

              <button
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 font-medium text-zinc-200 hover:border-zinc-600 disabled:opacity-60"
                type="button"
                onClick={() => setItinerary(null)}
                disabled={isLoading || !itinerary}
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* ITINERARY */}
        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">Itinerary</h2>
              <p className="mt-1 text-zinc-400 text-sm">
                {itinerary
                  ? `A ${itinerary.summary.vibe} for ${itinerary.destination}.`
                  : "Generate a plan to see it here."}
              </p>
            </div>

            {itinerary && (
              <div className="rounded-xl bg-zinc-950 px-3 py-2 text-sm text-zinc-200 border border-zinc-800">
                Est. total:{" "}
                <span className="font-medium">
                  ${itinerary.summary.estTotalCost.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {!itinerary ? (
            <p className="mt-4 text-zinc-400">
              {isLoading ? "Building your itinerary..." : "Your plan will appear here after you generate it."}
            </p>
          ) : (
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <h3 className="font-medium">Quick tips</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-zinc-300">
                  {itinerary.summary.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              {itinerary.days.map((d) => (
                <div key={d.day} className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium">Day {d.day}</h3>
                    <span className="text-xs text-zinc-500">{d.dateLabel}</span>
                  </div>

                  <div className="mt-3 grid gap-3">
                    {d.blocks.map((b) => (
                      <div
                        key={`${d.day}-${b.timeOfDay}-${b.title}`}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                              {b.timeOfDay}
                            </span>
                            <span className="font-medium">{b.title}</span>
                          </div>
                          <span className="text-xs text-zinc-400">~${b.estCost}/person</span>
                        </div>

                        <p className="mt-2 text-sm text-zinc-300">{b.description}</p>

                        <div className="mt-3">
                          <a
                            className="text-sm text-zinc-200 underline underline-offset-4 hover:text-white"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              b.mapQuery
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open map
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
