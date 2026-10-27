import type {
    ChatMessage,
    ContentItem,
    ContentStatus,
    TripDraft,
    SavedItinerary,
    Destination,
    ContentInput,
    ItineraryDay,
} from "./types";

export type AuthUser = {
    id: string;
    email: string;
    username: string;
    displayName: string;
    roles: string[];
    createdAt: string;
};

type ChatResponse = {
    message: string;
    days: ItineraryDay[];
    model: string;
    contextUsed: {
        destination: string;
        startDate: string | null;
        endDate: string | null;
        travelers: string | null;
        interests: string[];
        pace: string | null;
        transport: string | null;
        budget: string | null;
    };
};

async function json<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, { credentials: "include", ...options });
    const payload = (await response.json()) as T & { message?: string };
    if (!response.ok)
        throw new Error(payload.message || "Unable to connect to the server.");
    return payload;
}

export const getCurrentUser = () => json<{ user: AuthUser }>("/api/auth/me");
export const login = (username: string, password: string) =>
    json<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
export const register = (
    displayName: string,
    username: string,
    email: string,
    password: string,
) =>
    json<{ verificationRequired: true; email: string; expiresInSeconds: number; devCode?: string }>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, username, email, password }),
    });
export const verifyEmail = (email: string, code: string) => json<{ user: AuthUser }>("/api/auth/verify-email", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,code}) });
export const resendVerification = (email: string) => json<{ok:true;email:string;expiresInSeconds:number;devCode?:string}>("/api/auth/resend-verification", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email}) });
export const forgotPassword = (email:string) => json<{ok:true;email:string;expiresInSeconds:number;devCode?:string}>("/api/auth/forgot-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
export const resetPassword = (email:string,code:string,password:string) => json<{ok:true;username:string}>("/api/auth/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,code,password})});
export const logout = () =>
    json<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
export type AdminOverview = {
    users: number;
    pendingContent: number;
    publishedContent: number;
    openReports: number;
    onlineVisitors: number;
    byAudience: { guest: number; member: number; admin: number };
    byPath: Record<string, number>;
    delaySeconds: number;
};
export const sendPresenceHeartbeat = (visitorId: string, path: string, audience: "guest" | "member" | "admin") =>
    json<{ ok: boolean; expiresInSeconds: number }>("/api/presence/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, path, audience }),
    });
export type AdminUser = {
    id: string;
    email: string;
    username: string;
    displayName: string;
    status: string;
    createdAt: string;
    roles: string;
};
export const getAdminOverview = () =>
    json<AdminOverview>("/api/admin/overview");
export const getAdminUsers = () => json<AdminUser[]>("/api/admin/users");
export const updateAdminUser = (
    id: string,
    input: { roles?: string[]; status?: "ACTIVE" | "INACTIVE" },
) =>
    json<AdminUser>(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const getPublicContent = () => json<ContentItem[]>("/api/content/public");
export const getPublicContentBySlug = (slug: string) =>
    json<ContentItem>(`/api/content/public/${encodeURIComponent(slug)}`);
export const getContent = () => json<ContentItem[]>("/api/content");
export const createContent = (item: ContentInput) =>
    json<ContentItem>("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
export const updateContentStatus = (id: string, status: ContentStatus) =>
    json<ContentItem>(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
export const updateContent = (id: string, item: Partial<ContentInput>) =>
    json<ContentItem>(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
export const deleteContent = (id: string) =>
    json<{ ok: boolean; id: string }>(`/api/content/${id}`, {
        method: "DELETE",
    });
export const uploadArticleImage = (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return json<{
        url: string;
        filename: string;
        size: number;
        mimeType: string;
    }>("/api/media/articles", { method: "POST", body });
};

export const getMyItineraries = () =>
    json<SavedItinerary[]>("/api/itineraries");
export const saveItinerary = (trip: TripDraft, aiContent: string) => {
    const travelerCount = Number.parseInt(trip.travelers, 10) || 1;
    const budgetAmount = trip.budget
        ? Number(trip.budget.replace(/[^0-9]/g, "")) || null
        : null;
    return json<SavedItinerary>("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: `${trip.destination}${trip.startDate ? ` · ${trip.startDate}` : ""}`,
            destination: trip.destination,
            startDate: trip.startDate || null,
            endDate: trip.endDate || null,
            travelers: travelerCount,
            interests: trip.interests,
            pace: trip.pace || null,
            transport: trip.transport || null,
            budgetAmount,
            budgetCurrency: "KRW",
            aiContent,
        }),
    });
};
export const archiveItinerary = (id: string) =>
    json<{ ok: boolean; id: string }>(`/api/itineraries/${id}`, {
        method: "DELETE",
    });
export const getDestinations = (featured = false) =>
    json<{ items: Destination[] }>(
        `/api/destinations${featured ? "?featured=true" : ""}`,
    );

export async function sendChatMessage(
    messages: ChatMessage[],
    trip: TripDraft,
    signal?: AbortSignal,
): Promise<ChatResponse> {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: messages.map(({ role, content }) => ({ role, content })),
            trip,
        }),
        signal,
    });

    const payload = (await response.json()) as ChatResponse & {
        error?: string;
    };
    if (!response.ok) {
        throw new Error(payload.error || "Unable to connect to the AI assistant.");
    }
    return payload;
}
