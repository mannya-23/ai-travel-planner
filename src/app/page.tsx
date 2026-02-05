"use client"; 
// Marks this as a client component in Next.js (needed for hooks like useState)

import { useState } from "react";

/**
 * Fixed list of selectable interests
 * `as const` ensures literal string types instead of generic string
 */
const INTEREST_OPTIONS = ["Food", "Museums", "Nature", "Nightlife", "Shopping", "History"] as const;

/**
 * Represents a single activity block in a day
 */
type TimeBlock = {
  timeOfDay: "Morning" | "Afternoon" | "Evening";
  title: string;
  description: string;
  estCost: number; // estimated cost per person
  mapQuery: string; // used for Google Maps search
};

/**
 * Represents one day in the itinerary
 */
type ItineraryDay = {
  day: number;
  dateLabel: string;
  blocks: TimeBlock[];
};

/**
 * Full itinerary structure returned from the API
 */
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
  // Form state
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState<number | "">("");
  const [travelers, setTravelers] = useState<number>(1);

  // UI + data state
  const [isLoading, setIsLoading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  /**
   * Toggles an interest on/off in the interests array
   */
  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((x) => x !== interest)
        : [...prev, interest]
    );
  };

  /**
   * Sends trip details to the API and retrieves itinerary
   */
  const onGenerate = async () => {
    setIsLoading(true);

    try {
      // Data sent to backend
      const payload = { destination, startDate, endDate, budget, travelers, interests };

      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // Handle API errors
      if (!res.ok) {
        throw new Error(data?.error || `Request failed: ${res.status}`);
      }

      // Save itinerary response
      setItinerary(data as Itinerary);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "API call failed — check console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        
        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">AI Travel Planner</h1>
          <p className="mt-2 text-zinc-400">
            Generate a structured itinerary from your dates, budget, and interests.
          </p>
        </header>

        {/* INPUT FORM */}
        <section className="rounded-2xl bg-zinc-900/60 p-6 shadow">
          <h2 className="text-lg font-medium">Trip details</h2>

          <div className="mt-4 grid gap-4">

            {/* DESTINATION */}
            <div>
              <label className="text-sm text-zinc-300">Destination</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
                placeholder="e.g., Tokyo"
              />
            </div>

            {/* DATES */}
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

            {/* BUDGET + TRAVELERS */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Budget (USD)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) =>
                    setBudget(e.target.value === "" ? "" : Number(e.target.value))
                  }
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
                  min={1}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            {/* INTERESTS */}
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
                type="button"
                onClick={onGenerate}
                disabled={isLoading || !destination.trim()}
                className="rounded-xl bg-zinc-100 px-4 py-2 font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
              >
                {isLoading ? "Generating..." : "Generate itinerary"}
              </button>

              <button
                type="button"
                onClick={() => setItinerary(null)}
                disabled={isLoading || !itinerary}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 font-medium text-zinc-200 hover:border-zinc-600 disabled:opacity-60"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* ITINERARY DISPLAY */}
        {/* Renders only after API response */}
        ...
      </div>
    </main>
  );
}
