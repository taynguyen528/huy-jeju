import {
    BadGatewayException,
    BadRequestException,
    Controller,
    Inject,
    Post,
    ServiceUnavailableException,
    Body,
} from "@nestjs/common";
import { PlaceResolverService } from "../maps/place-resolver.service.js";

type IncomingMessage = { role: "user" | "assistant"; content: string };
type TripDraft = {
    destination?: string;
    startDate?: string;
    endDate?: string;
    travelers?: string;
    interests?: string[];
    pace?: string;
    transport?: string;
    budget?: string;
};

type TripContext = {
    destination: string;
    startDate: string | null;
    endDate: string | null;
    travelers: string | null;
    interests: string[];
    pace: string | null;
    transport: string | null;
    budget: string | null;
};

type ItineraryDay = { day: number; title: string; mainPlaces: string[] };

function extractItineraryData(raw: string): { message: string; days: ItineraryDay[] } {
    const block = raw.match(/<itinerary_data>\s*(?:```json\s*)?([\s\S]*?)(?:\s*```)?\s*<\/itinerary_data>/i);
    if (!block) return { message: raw.trim(), days: [] };

    const message = raw.replace(block[0], "").trim();
    try {
        const parsed = JSON.parse(block[1]) as { days?: unknown };
        if (!Array.isArray(parsed.days)) return { message, days: [] };
        const days = parsed.days.flatMap((value): ItineraryDay[] => {
            if (!value || typeof value !== "object") return [];
            const candidate = value as { day?: unknown; title?: unknown; mainPlaces?: unknown };
            const day = Number(candidate.day);
            if (!Number.isInteger(day) || day < 1 || typeof candidate.title !== "string" || !Array.isArray(candidate.mainPlaces)) return [];
            const mainPlaces = [...new Set(candidate.mainPlaces
                .filter((place): place is string => typeof place === "string")
                .map((place) => place.trim())
                .filter(Boolean))].slice(0, 12);
            if (!mainPlaces.length) return [];
            return [{ day, title: candidate.title.trim().slice(0, 160), mainPlaces }];
        }).sort((a, b) => a.day - b.day).slice(0, 30);
        return { message, days };
    } catch {
        return { message, days: [] };
    }
}

@Controller("chat")
export class ChatController {
    constructor(@Inject(PlaceResolverService) private readonly placeResolver: PlaceResolverService) {}

    @Post()
    async chat(
        @Body() body: { messages?: IncomingMessage[]; trip?: TripDraft },
    ) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey)
            throw new ServiceUnavailableException(
                "OPENAI_API_KEY is not configured in the .env file.",
            );

        const messages = Array.isArray(body?.messages) ? body.messages : [];
        const trip = body?.trip || {};
        const validMessages = messages
            .filter(
                (item) =>
                    (item.role === "user" || item.role === "assistant") &&
                    typeof item.content === "string",
            )
            .slice(-16)
            .map((item) => ({ role: item.role, content: item.content.slice(0, 5000) }));

        if (!validMessages.length || validMessages.at(-1)?.role !== "user")
            throw new BadRequestException("Invalid message.");

        const contextUsed: TripContext = {
            destination: trip.destination?.trim() || "Jeju, South Korea",
            startDate: trip.startDate?.trim() || null,
            endDate: trip.endDate?.trim() || null,
            travelers: trip.travelers?.trim() || null,
            interests: Array.isArray(trip.interests)
                ? trip.interests
                      .filter(
                          (item): item is string =>
                              typeof item === "string" && Boolean(item.trim()),
                      )
                      .map((item) => item.trim())
                : [],
            pace: trip.pace?.trim() || null,
            transport: trip.transport?.trim() || null,
            budget: trip.budget?.trim() || null,
        };

        const context = [
            `Destination: ${contextUsed.destination}`,
            `Start date: ${contextUsed.startDate || "not specified"}`,
            `End date: ${contextUsed.endDate || "not specified"}`,
            `Travelers: ${contextUsed.travelers || "not specified"}`,
            `Interests: ${contextUsed.interests.length ? contextUsed.interests.join(", ") : "not specified"}`,
            `Pace: ${contextUsed.pace || "not specified"}`,
            `Transport: ${contextUsed.transport || "not specified"}`,
            `Budget: ${contextUsed.budget || "not specified"}`,
        ].join("\n");

        const model = process.env.OPENAI_MODEL || "gpt-6.1-sol";
        let rawMessage: string;
        try {
            const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60_000);
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: "system", content: `You are Taewak, an English-language Jeju travel itinerary assistant.

CURRENT TRIP DETAILS FROM THE FORM:
${context}

Information rules:
- Treat the form data above as the current source of truth and prioritize it over older conversation details.
- Tailor suggestions to the destination, party size, and selected interests.
- Do not ask again for a field that already has a value.
- If travel dates are unspecified, you may still propose an itinerary for the requested number of days; state that exact dates have not been selected.
- Apply form changes immediately in the next response.
- For itinerary requests with dates, organize the plan by actual day. Each activity needs a time window, area, duration, transport suggestion, and estimated cost.
- End itineraries with a budget summary, advance-booking notes, and preparation checklist.
- Do not overlap activities or propose unrealistic travel times. Clearly flag details that require current verification.
- Reply in friendly, clear, helpful English. Never invent opening hours, prices, or other time-sensitive data.

Machine-readable itinerary data:
- When your answer contains a day-by-day itinerary, append exactly one JSON block after the human-readable Markdown.
- Use this exact wrapper and valid JSON with no commentary after it:
<itinerary_data>
{"days":[{"day":1,"title":"Short day title","mainPlaces":["Specific place name","Specific place name"]}]}
</itinerary_data>
- Include exactly one day object for every day shown in the human-readable itinerary. Never omit later days.
- Include 2-5 main places per day in visit order whenever the itinerary contains that many named attractions.
- Include only named destinations or attractions that the traveler intentionally visits. Exclude meals, hotels, generic areas, transport stops, and vague activities.
- If the answer is not a day-by-day itinerary, do not append the block.` },
                        ...validMessages,
                    ],
                    temperature: 0.7,
                    max_tokens: 6000,
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            const payload = await response.json() as {
                choices?: Array<{ message?: { content?: string } }>;
                error?: { message?: string };
            };
            if (!response.ok) throw new Error(payload.error?.message || `Gateway returned HTTP ${response.status}`);
            const content = payload.choices?.[0]?.message?.content?.trim();
            if (!content) throw new Error("Empty response");
            rawMessage = content;
        } catch (error) {
            console.error(error);
            throw new BadGatewayException(
                "The AI gateway is not responding. Check OPENAI_BASE_URL, OPENAI_API_KEY, and OPENAI_MODEL, then try again.",
            );
        }

        const { message, days } = extractItineraryData(rawMessage);
        try {
            const resolvedDays = await this.placeResolver.resolveDays(days);
            return { message, days: resolvedDays, model, contextUsed };
        } catch (error) {
            console.error("Unable to resolve itinerary map places:", error);
            return { message, days: [], model, contextUsed, mapWarning: "The itinerary was created, but map locations could not be loaded." };
        }
    }
}
