import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import { existsSync, mkdirSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { diskStorage } from 'multer'
import { randomUUID } from 'node:crypto'
import { AdminGuard } from '../auth/admin.guard.js'

const uploadDirectory = resolve(process.cwd(), 'uploads', 'articles')
mkdirSync(uploadDirectory, { recursive: true })
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

@Controller('media')
export class MediaController {
  @Post('articles')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({ destination: uploadDirectory, filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`) }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith('image/') && allowedExtensions.has(extname(file.originalname).toLowerCase())),
  }))
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF tối đa 5 MB.')
    return { url: `/api/media/files/${file.filename}`, filename: file.filename, size: file.size, mimeType: file.mimetype }
  }

  @Get('files/:filename')
  file(@Param('filename') filename: string, @Res() response: Response) {
    if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) throw new BadRequestException('Tên file không hợp lệ.')
    const path = resolve(uploadDirectory, filename)
    if (!existsSync(path)) return response.status(404).json({ message: 'Không tìm thấy ảnh.' })
    return response.sendFile(path)
  }
}
