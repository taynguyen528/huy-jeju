import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Inject,
    Post,
} from "@nestjs/common";
import { PresenceService } from "./presence.service.js";

const audiences = ["guest", "member", "admin"] as const;

@Controller("presence")
export class PresenceController {
    constructor(
        @Inject(PresenceService) private readonly presence: PresenceService,
    ) {}

    @Post("heartbeat")
    heartbeat(
        @Body()
        body: {
            visitorId?: string;
            path?: string;
            audience?: (typeof audiences)[number];
        },
    ) {
        if (!body.visitorId || !/^[a-zA-Z0-9-]{10,80}$/.test(body.visitorId))
            throw new BadRequestException("Visitor ID không hợp lệ.");
        const audience = audiences.includes(
            body.audience as (typeof audiences)[number],
        )
            ? body.audience!
            : "guest";
        const path =
            typeof body.path === "string" && body.path.startsWith("/")
                ? body.path.slice(0, 160)
                : "/";
        return this.presence.heartbeat(body.visitorId, path, audience);
    }

    @Delete("heartbeat")
    leave(@Body() body: { visitorId?: string }) {
        if (body.visitorId) return this.presence.remove(body.visitorId);
        return { ok: true };
    }
}
