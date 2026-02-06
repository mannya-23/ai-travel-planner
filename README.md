# AI Travel Planner ✈️

An AI-powered travel itinerary generator built with Next.js and OpenAI.  
Users enter a destination, travel dates, budget, number of travelers, and interests to receive a structured, multi-day itinerary.

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- OpenAI Responses API
- Tailwind CSS
- Node.js

## Features
- Multi-day, date-aware itineraries
- Interest-based activity planning
- Budget-aware suggestions
- Structured AI-generated JSON
- Google Maps–ready locations

## Getting Started

1. Install dependencies
```
npm install
```
2. Create a .env.local file
In the root of the project, add:
```
OPENAI_API_KEY=your_openai_api_key_here
```
3. Run the development server
```
npm run dev
```
4. Open `http://localhost:3000` in your browser.


Trip Configuration

Users enter destination, dates, budget, travelers, and interests to generate a personalized itinerary.

<img width="985" alt="Trip configuration form" src="https://github.com/user-attachments/assets/ab6e2f62-f250-4ba5-b2b7-13fef8c0ee30" />
AI-Generated Trip Summary

High-level overview including trip vibe, estimated total cost, and practical travel tips.

<img width="904" alt="AI-generated trip summary" src="https://github.com/user-attachments/assets/dd1e2818-6e50-4c0a-8087-50293323da6b" />
Day-by-Day Itinerary Details

Structured daily plan with morning, afternoon, and evening activities, descriptions, estimated costs, and Google Maps links.

<img width="952" alt="Day-by-day itinerary details" src="https://github.com/user-attachments/assets/c5d9f35f-f130-42e4-85e4-412f90c4ea52" />

