import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      ok: true,
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    }
  }
}
