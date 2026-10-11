import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { DatabaseService } from '../database/database.service.js'

const accounts = [
  { username:'admin', name: 'Jeju Admin', email: 'pttnguyen528@gmail.com', password: 'Pttn2002@', roles: ['ADMIN', 'MEMBER'] },
  { username:'editor', name: 'Minji Editor', email: 'editor@jeju.local', password: 'Editor@2026', roles: ['EDITOR', 'MEMBER'] },
  { username:'moderator', name: 'Hana Moderator', email: 'moderator@jeju.local', password: 'Moderator@2026', roles: ['MODERATOR', 'MEMBER'] },
  { username:'huy', name: 'Huy Traveler', email: 'huy@jeju.local', password: 'Member@2026', roles: ['MEMBER'] },
  { username:'linh', name: 'Linh Explorer', email: 'linh@jeju.local', password: 'Member@2026', roles: ['MEMBER'] },
  { username:'nam', name: 'Nam Photographer', email: 'nam@jeju.local', password: 'Member@2026', roles: ['MEMBER'] },
]

const database = new DatabaseService()
const now = new Date().toISOString()

for (const account of accounts) {
  let user = database.connection.prepare('SELECT id FROM users WHERE email = ?').get(account.email) as { id: string } | undefined
  const passwordHash = await bcrypt.hash(account.password, 12)
  if (!user) {
    user = { id: randomUUID() }
    database.connection.prepare('INSERT INTO users (id,email,username,email_verified,password_hash,display_name,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').run(user.id, account.email, account.username, 1, passwordHash, account.name, 'ACTIVE', now, now)
  } else {
    database.connection.prepare('UPDATE users SET username=?,email_verified=1,password_hash=?,display_name=?,status=?,updated_at=? WHERE id=?').run(account.username, passwordHash, account.name, 'ACTIVE', now, user.id)
  }
  for (const role of account.roles) {
    database.connection.prepare('INSERT OR IGNORE INTO user_roles (user_id,role_id,assigned_at) SELECT ?,id,? FROM roles WHERE code=?').run(user.id, now, role)
  }
}

database.onModuleDestroy()
console.log(`Seeded ${accounts.length} local test accounts.`)
