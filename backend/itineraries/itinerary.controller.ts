import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common'
import { MemberGuard, type AuthenticatedRequest } from '../auth/member.guard.js'
import { ItineraryService, type ItineraryInput } from './itinerary.service.js'

@Controller('itineraries')
@UseGuards(MemberGuard)
export class ItineraryController {
  constructor(@Inject(ItineraryService) private readonly itineraries: ItineraryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) { return this.itineraries.findMine(request.authUser.id) }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: ItineraryInput) {
    if (!body?.title?.trim() || !body?.destination?.trim() || !body?.aiContent?.trim()) throw new BadRequestException('Tên, điểm đến và nội dung lịch trình là bắt buộc.')
    if (!Number.isInteger(body.travelers) || body.travelers < 1 || body.travelers > 30) throw new BadRequestException('Số người không hợp lệ.')
    if (body.startDate && body.endDate && body.endDate < body.startDate) throw new BadRequestException('Ngày về không thể trước ngày đi.')
    return this.itineraries.create(request.authUser.id, body)
  }

  @Delete(':id')
  archive(@Req() request: AuthenticatedRequest, @Param('id') id: string) { return this.itineraries.remove(id, request.authUser.id) }
}
