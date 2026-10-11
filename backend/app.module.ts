import { Module } from '@nestjs/common'
import { ChatController } from './chat/chat.controller.js'
import { ContentController } from './content/content.controller.js'
import { ContentService } from './content/content.service.js'
import { HealthController } from './health.controller.js'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth/auth.controller.js'
import { AuthService } from './auth/auth.service.js'
import { DatabaseService } from './database/database.service.js'
import { AdminGuard } from './auth/admin.guard.js'
import { AdminController } from './admin/admin.controller.js'
import { MemberGuard } from './auth/member.guard.js'
import { ItineraryController } from './itineraries/itinerary.controller.js'
import { ItineraryService } from './itineraries/itinerary.service.js'
import { MediaController } from './media/media.controller.js'
import { DestinationController } from './destinations/destination.controller.js'
import { DestinationService } from './destinations/destination.service.js'
import { PresenceController } from './presence/presence.controller.js'
import { PresenceService } from './presence/presence.service.js'
import { MailService } from './auth/mail.service.js'

@Module({
  imports: [JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'development-only-change-me', signOptions: { expiresIn: '7d' } })],
  controllers: [HealthController, ChatController, ContentController, AuthController, AdminController, ItineraryController, MediaController, DestinationController, PresenceController],
  providers: [ContentService, DatabaseService, AuthService, MailService, AdminGuard, MemberGuard, ItineraryService, DestinationService, PresenceService],
})
export class AppModule {}
