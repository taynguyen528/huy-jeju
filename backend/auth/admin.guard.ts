import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService, type SafeUser } from "./auth.service.js";

export type AdminRequest = Request & { authUser: SafeUser };

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(@Inject(AuthService) private readonly auth: AuthService) {}
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<AdminRequest>();
        const token = request.cookies?.jeju_session as string | undefined;
        if (!token) throw new UnauthorizedException("Bạn chưa đăng nhập.");
        const user = this.auth.verify(token);
        if (!user.roles.includes("ADMIN"))
            throw new ForbiddenException("Bạn không có quyền quản trị.");
        request.authUser = user;
        return true;
    }
}
