import { Controller, Get, Inject, Param, Query } from '@nestjs/common'
import { DestinationService } from './destination.service.js'

@Controller('destinations')
export class DestinationController {
  constructor(@Inject(DestinationService) private readonly destinations: DestinationService) {}

  @Get()
  findAll(@Query('featured') featured?: string) {
    return { items: this.destinations.findAll(featured) }
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return { item: this.destinations.findBySlug(slug) }
  }
}
