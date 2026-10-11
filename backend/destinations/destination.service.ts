import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service.js'

@Injectable()
export class DestinationService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  findAll(featured?: string) {
    const where = featured === 'true' ? 'WHERE featured = 1' : ''
    return this.database.connection.prepare(`SELECT * FROM destinations ${where} ORDER BY featured DESC, name_vi ASC`).all()
  }

  findBySlug(slug: string) {
    const item = this.database.connection.prepare('SELECT * FROM destinations WHERE slug = ?').get(slug)
    if (!item) throw new NotFoundException('Không tìm thấy địa điểm')
    return item
  }
}
