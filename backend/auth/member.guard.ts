import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService, type SafeUser } from "./auth.service.js";

export type AuthenticatedRequest = Request & { authUser: SafeUser };

@Injectable()
export class MemberGuard implements CanActivate {
    constructor(@Inject(AuthService) private readonly auth: AuthService) {}

    canActivate(context: ExecutionContext) {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        const token = request.cookies?.jeju_session as string | undefined;
        if (!token)
            throw new UnauthorizedException(
                "You must sign in to save an itinerary.",
            );
        const user = this.auth.verify(token);
        if (user.roles.includes("ADMIN"))
            throw new ForbiddenException(
                "Administrator accounts cannot use personal itineraries.",
            );
        request.authUser = user;
        return true;
    }
}
