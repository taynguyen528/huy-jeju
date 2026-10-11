import { Injectable } from '@nestjs/common'

type Audience = 'guest' | 'member' | 'admin'
type PresenceEntry = { lastSeen: number; path: string; audience: Audience }

@Injectable()
export class PresenceService {
  private readonly visitors = new Map<string, PresenceEntry>()
  private readonly onlineWindowMs = 45_000

  heartbeat(visitorId: string, path: string, audience: Audience) {
    this.prune()
    this.visitors.set(visitorId, { lastSeen: Date.now(), path, audience })
    return { ok: true, expiresInSeconds: this.onlineWindowMs / 1000 }
  }

  remove(visitorId: string) {
    this.visitors.delete(visitorId)
    return { ok: true }
  }

  summary() {
    this.prune()
    const entries = [...this.visitors.values()]
    const byAudience = { guest: 0, member: 0, admin: 0 }
    const byPath: Record<string, number> = {}
    for (const entry of entries) {
      byAudience[entry.audience] += 1
      byPath[entry.path] = (byPath[entry.path] || 0) + 1
    }
    return { onlineVisitors: entries.length, byAudience, byPath, delaySeconds: 15 }
  }

  private prune() {
    const cutoff = Date.now() - this.onlineWindowMs
    for (const [id, entry] of this.visitors) if (entry.lastSeen < cutoff) this.visitors.delete(id)
  }
}
