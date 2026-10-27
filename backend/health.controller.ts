import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      ok: true,
      model: process.env.OPENAI_MODEL || 'gpt-6.1-sol',
      aiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    }
  }
}
