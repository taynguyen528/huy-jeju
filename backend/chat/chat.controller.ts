import {
    BadGatewayException,
    BadRequestException,
    Controller,
    Post,
    ServiceUnavailableException,
    Body,
} from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";

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

@Controller("chat")
export class ChatController {
    @Post()
    async chat(
        @Body() body: { messages?: IncomingMessage[]; trip?: TripDraft },
    ) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            throw new ServiceUnavailableException(
                "Chưa cấu hình GEMINI_API_KEY trong file .env.",
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
            .map((item) => ({
                role:
                    item.role === "assistant"
                        ? ("model" as const)
                        : ("user" as const),
                parts: [{ text: item.content.slice(0, 5000) }],
            }));

        if (!validMessages.length || validMessages.at(-1)?.role !== "user")
            throw new BadRequestException("Tin nhắn không hợp lệ.");

        const contextUsed: TripContext = {
            destination: trip.destination?.trim() || "Jeju, Hàn Quốc",
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
            `Điểm đến: ${contextUsed.destination}`,
            `Ngày đi: ${contextUsed.startDate || "chưa xác định"}`,
            `Ngày về: ${contextUsed.endDate || "chưa xác định"}`,
            `Số người: ${contextUsed.travelers || "chưa xác định"}`,
            `Sở thích: ${contextUsed.interests.length ? contextUsed.interests.join(", ") : "chưa xác định"}`,
            `Nhịp độ: ${contextUsed.pace || "chưa xác định"}`,
            `Phương tiện: ${contextUsed.transport || "chưa xác định"}`,
            `Ngân sách: ${contextUsed.budget || "chưa xác định"}`,
        ].join("\n");

        try {
            const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
            const result = await new GoogleGenAI({
                apiKey,
            }).models.generateContent({
                model,
                contents: validMessages,
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 6000,
                    systemInstruction: `Bạn là Taewak, trợ lý lập lịch trình du lịch Jeju bằng tiếng Việt.

THÔNG TIN CHUYẾN ĐI HIỆN TẠI TỪ FORM:
${context}

Quy tắc sử dụng thông tin:
- Luôn coi dữ liệu từ form phía trên là nguồn thông tin hiện tại và ưu tiên hơn dữ liệu cũ trong hội thoại.
- Phải điều chỉnh gợi ý theo điểm đến, số người và các sở thích đã chọn.
- Không hỏi lại trường đã có giá trị.
- Nếu ngày đi hoặc ngày về chưa xác định, vẫn có thể đề xuất lịch trình theo số ngày người dùng yêu cầu và chỉ ghi rõ ngày cụ thể chưa được chọn.
- Nếu người dùng thay đổi form, áp dụng giá trị mới ngay ở câu trả lời kế tiếp.
- Khi người dùng yêu cầu lịch trình, trình bày theo từng ngày thực tế nếu đã có ngày đi và về; mỗi hoạt động cần có khung giờ, khu vực, thời lượng, gợi ý di chuyển và chi phí ước tính.
- Cuối lịch trình phải có phần tổng hợp ngân sách, lưu ý đặt trước và checklist chuẩn bị.
- Không xếp hoạt động trùng giờ hoặc lịch di chuyển phi thực tế. Nếu thiếu dữ liệu cập nhật, phải ghi rõ cần kiểm tra lại.
- Trả lời thân thiện, rõ ràng và hữu ích. Không bịa giờ mở cửa, giá hoặc dữ liệu thay đổi theo thời gian.`,
                },
            });
            const message = result.text?.trim();
            if (!message) throw new Error("Empty response");
            return { message, model, contextUsed };
        } catch (error) {
            console.error(error);
            throw new BadGatewayException(
                "Gemini đang không phản hồi. Vui lòng kiểm tra API key, model hoặc thử lại.",
            );
        }
    }
}
