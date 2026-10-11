import { BadRequestException, Body, Controller, ForbiddenException, Get, Inject, NotFoundException, Param, Patch, Req, UseGuards } from '@nestjs/common'
import { DatabaseService } from '../database/database.service.js'
import { AdminGuard, type AdminRequest } from '../auth/admin.guard.js'
import { PresenceService } from '../presence/presence.service.js'

const allowedRoles = ['MEMBER', 'EDITOR', 'MODERATOR', 'ADMIN'] as const
type RoleCode = typeof allowedRoles[number]

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService, @Inject(PresenceService) private readonly presence: PresenceService) {}
  @Get('overview')
  overview() {
    const users = this.db.connection.prepare('SELECT COUNT(*) count FROM users WHERE status = ?').get('ACTIVE') as { count: number }
    const pending = this.db.connection.prepare("SELECT COUNT(*) count FROM contents WHERE status = 'review'").get() as { count: number }
    const published = this.db.connection.prepare("SELECT COUNT(*) count FROM contents WHERE status = 'published'").get() as { count: number }
    return { users: users.count, pendingContent: pending.count, publishedContent: published.count, openReports: 0, ...this.presence.summary() }
  }
  @Get('users')
  users() {
    return this.db.connection.prepare("SELECT u.id,u.email,u.username,u.display_name displayName,u.status,u.created_at createdAt,COALESCE(GROUP_CONCAT(r.code), '') roles FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id GROUP BY u.id ORDER BY u.created_at DESC").all()
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: { status?: string; roles?: string[] }, @Req() request: AdminRequest) {
    const target = this.db.connection.prepare('SELECT id, status FROM users WHERE id = ?').get(id) as { id: string; status: string } | undefined
    if (!target) throw new NotFoundException('Không tìm thấy tài khoản.')
    const nextStatus = body.status
    if (nextStatus !== undefined && !['ACTIVE', 'INACTIVE'].includes(nextStatus)) throw new BadRequestException('Trạng thái không hợp lệ.')
    const nextRoles = body.roles
    if (nextRoles !== undefined) {
      if (!Array.isArray(nextRoles)) throw new BadRequestException('Danh sách vai trò phải là một mảng.')
      const unique = [...new Set(nextRoles)]
      if (!unique.length || unique.some((role) => !allowedRoles.includes(role as RoleCode))) throw new BadRequestException('Danh sách vai trò không hợp lệ.')
      body.roles = unique
    }
    if (id === request.authUser.id && (nextStatus === 'INACTIVE' || (nextRoles && !nextRoles.includes('ADMIN')))) {
      throw new ForbiddenException('Bạn không thể tự vô hiệu hóa hoặc tự gỡ quyền Admin.')
    }
    const currentRoles = this.db.connection.prepare('SELECT r.code FROM roles r JOIN user_roles ur ON ur.role_id=r.id WHERE ur.user_id=?').all(id) as { code: string }[]
    const removesAdmin = currentRoles.some(({ code }) => code === 'ADMIN') && ((nextRoles && !nextRoles.includes('ADMIN')) || nextStatus === 'INACTIVE')
    if (removesAdmin) {
      const activeAdmins = this.db.connection.prepare("SELECT COUNT(DISTINCT u.id) count FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.status='ACTIVE' AND r.code='ADMIN'").get() as { count: number }
      if (activeAdmins.count <= 1) throw new ForbiddenException('Hệ thống phải còn ít nhất một Admin đang hoạt động.')
    }
    const timestamp = new Date().toISOString()
    this.db.connection.transaction(() => {
      if (nextStatus) this.db.connection.prepare('UPDATE users SET status=?, updated_at=? WHERE id=?').run(nextStatus, timestamp, id)
      if (nextRoles) {
        this.db.connection.prepare('DELETE FROM user_roles WHERE user_id=?').run(id)
        const assign = this.db.connection.prepare('INSERT INTO user_roles (user_id,role_id,assigned_at) SELECT ?,id,? FROM roles WHERE code=?')
        for (const role of nextRoles) assign.run(id, timestamp, role)
      }
    })()
    return this.db.connection.prepare("SELECT u.id,u.email,u.username,u.display_name displayName,u.status,u.created_at createdAt,COALESCE(GROUP_CONCAT(r.code), '') roles FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id WHERE u.id=? GROUP BY u.id").get(id)
  }
}
