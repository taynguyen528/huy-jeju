import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "../database/database.service.js";

export type ItineraryInput = {
    title: string;
    destination: string;
    startDate?: string | null;
    endDate?: string | null;
    travelers: number;
    interests: string[];
    pace?: string | null;
    transport?: string | null;
    budgetAmount?: number | null;
    budgetCurrency?: string;
    aiContent: string;
};

type ItineraryRow = {
    id: string;
    owner_id: string;
    title: string;
    destination_name: string;
    start_date: string | null;
    end_date: string | null;
    travelers: number;
    interests: string;
    pace: string | null;
    transport: string | null;
    budget_amount: number | null;
    budget_currency: string;
    ai_content: string;
    status: string;
    created_at: string;
    updated_at: string;
};

@Injectable()
export class ItineraryService {
    constructor(
        @Inject(DatabaseService) private readonly database: DatabaseService,
    ) {}

    findMine(ownerId: string) {
        return (
            this.database.connection
                .prepare(
                    "SELECT * FROM itineraries WHERE owner_id = ? AND status != ? ORDER BY updated_at DESC",
                )
                .all(ownerId, "ARCHIVED") as ItineraryRow[]
        ).map(this.toItem);
    }

    create(ownerId: string, input: ItineraryInput) {
        const id = randomUUID();
        const timestamp = new Date().toISOString();
        this.database.connection
            .prepare(
                `INSERT INTO itineraries (id,owner_id,title,destination_name,start_date,end_date,travelers,interests,pace,transport,budget_amount,budget_currency,ai_content,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'DRAFT',?,?)`,
            )
            .run(
                id,
                ownerId,
                input.title.trim(),
                input.destination.trim(),
                input.startDate || null,
                input.endDate || null,
                input.travelers,
                JSON.stringify(input.interests || []),
                input.pace || null,
                input.transport || null,
                input.budgetAmount ?? null,
                input.budgetCurrency || "KRW",
                input.aiContent.trim(),
                timestamp,
                timestamp,
            );
        return this.getMine(id, ownerId);
    }

    remove(id: string, ownerId: string) {
        this.getMine(id, ownerId);
        this.database.connection
            .prepare(
                "UPDATE itineraries SET status = ?, updated_at = ? WHERE id = ? AND owner_id = ?",
            )
            .run("ARCHIVED", new Date().toISOString(), id, ownerId);
        return { ok: true, id };
    }

    private getMine(id: string, ownerId: string) {
        const row = this.database.connection
            .prepare("SELECT * FROM itineraries WHERE id = ? AND owner_id = ?")
            .get(id, ownerId) as ItineraryRow | undefined;
        if (!row) throw new NotFoundException("Không tìm thấy lịch trình.");
        return this.toItem(row);
    }

    private readonly toItem = (row: ItineraryRow) => ({
        id: row.id,
        title: row.title,
        destination: row.destination_name,
        startDate: row.start_date,
        endDate: row.end_date,
        travelers: row.travelers,
        interests: JSON.parse(row.interests) as string[],
        pace: row.pace,
        transport: row.transport,
        budgetAmount: row.budget_amount,
        budgetCurrency: row.budget_currency,
        aiContent: row.ai_content,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}
