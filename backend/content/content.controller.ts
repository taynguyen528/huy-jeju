import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ContentService } from './content.service.js'
import type { ContentInput, ContentLocale, ContentStatus } from './content.types.js'
import { AdminGuard } from '../auth/admin.guard.js'

const statuses: ContentStatus[] = ['draft', 'review', 'published', 'archived']
const locales: ContentLocale[] = ['vi', 'en', 'ko']

@Controller('content')
export class ContentController {
  constructor(@Inject(ContentService) private readonly content: ContentService) {}

  @Get('public')
  publicList(@Query('locale') locale?: ContentLocale) { return this.content.findPublished(this.locale(locale)) }

  @Get('public/:slug')
  publicDetail(@Param('slug') slug: string, @Query('locale') locale?: ContentLocale) { return this.content.findPublishedBySlug(slug, this.locale(locale)) }

  @Get()
  @UseGuards(AdminGuard)
  list(@Query('status') status?: ContentStatus) { return this.content.findAll(status) }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: ContentInput) { this.validate(body); return this.content.create(body) }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() body: Partial<ContentInput>) { this.validatePartial(body); return this.content.update(id, body) }

  @Delete(':id')
  @UseGuards(AdminGuard)
  archive(@Param('id') id: string) { return this.content.remove(id) }

  private validate(body: ContentInput) {
    const vi = body?.translations?.vi
    if (!vi?.title?.trim() || !body?.slug?.trim() || !vi?.body?.trim()) throw new BadRequestException('Tiêu đề, slug và nội dung tiếng Việt là bắt buộc.')
    if (!/^[a-z0-9-]+$/.test(body.slug)) throw new BadRequestException('Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.')
    if (!statuses.includes(body.status)) throw new BadRequestException('Trạng thái không hợp lệ.')
  }

  private validatePartial(body: Partial<ContentInput>) {
    const requiredText: (keyof ContentInput)[] = ['slug', 'topic', 'author']
    for (const field of requiredText) if (body[field] !== undefined && !String(body[field]).trim()) throw new BadRequestException(`${field} không được để trống.`)
    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) throw new BadRequestException('Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.')
    if (body.status && !statuses.includes(body.status)) throw new BadRequestException('Trạng thái không hợp lệ.')
    if (body.translations?.vi && (!body.translations.vi.title?.trim() || !body.translations.vi.body?.trim())) throw new BadRequestException('Tiêu đề và nội dung tiếng Việt không được để trống.')
  }

  private locale(locale?: ContentLocale) { return locale && locales.includes(locale) ? locale : 'vi' }
}
