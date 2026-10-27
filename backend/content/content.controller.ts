import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ContentService } from "./content.service.js";
import type { ContentInput, ContentStatus } from "./content.types.js";
import { AdminGuard } from "../auth/admin.guard.js";

const statuses: ContentStatus[] = ["draft", "review", "published", "archived"];

@Controller("content")
export class ContentController {
    constructor(
        @Inject(ContentService) private readonly content: ContentService,
    ) {}
    @Get("public") publicList() {
        return this.content.findPublished();
    }
    @Get("public/:slug") publicDetail(@Param("slug") slug: string) {
        return this.content.findPublishedBySlug(slug);
    }
    @Get() @UseGuards(AdminGuard) list(
        @Query("status") status?: ContentStatus,
    ) {
        return this.content.findAll(status);
    }
    @Post() @UseGuards(AdminGuard) create(@Body() body: ContentInput) {
        this.validate(body);
        return this.content.create(body);
    }
    @Patch(":id") @UseGuards(AdminGuard) update(
        @Param("id") id: string,
        @Body() body: Partial<ContentInput>,
    ) {
        this.validatePartial(body);
        return this.content.update(id, body);
    }
    @Delete(":id") @UseGuards(AdminGuard) archive(@Param("id") id: string) {
        return this.content.remove(id);
    }

    private validate(body: ContentInput) {
        if (!body?.title?.trim() || !body?.slug?.trim() || !body?.body?.trim())
            throw new BadRequestException(
                "Title, slug, and body are required.",
            );
        if (!/^[a-z0-9-]+$/.test(body.slug))
            throw new BadRequestException(
                "Slug may only contain lowercase letters, numbers, and hyphens.",
            );
        if (!statuses.includes(body.status))
            throw new BadRequestException("Invalid content status.");
    }
    private validatePartial(body: Partial<ContentInput>) {
        const requiredText: (keyof ContentInput)[] = [
            "title",
            "slug",
            "body",
            "topic",
            "author",
        ];
        for (const field of requiredText)
            if (body[field] !== undefined && !String(body[field]).trim())
                throw new BadRequestException(`${field} cannot be empty.`);
        if (body.slug && !/^[a-z0-9-]+$/.test(body.slug))
            throw new BadRequestException(
                "Slug may only contain lowercase letters, numbers, and hyphens.",
            );
        if (body.status && !statuses.includes(body.status))
            throw new BadRequestException("Invalid content status.");
    }
}
