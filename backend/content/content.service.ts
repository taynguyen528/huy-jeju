import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service.js'
import type { ContentInput, ContentItem, ContentStatus } from './content.types.js'

const now = () => new Date().toISOString()
type ContentRow = { id:string; title:string; slug:string; excerpt:string; body:string; topic:string; status:ContentStatus; author:string; cover_image_url:string; created_at:string; updated_at:string }
const starterContent = [
  { title:'Haenyeo — the women of the sea', slug:'haenyeo-women-of-the-sea', excerpt:'The story of the women divers who have sustained Jeju’s coastal life for generations.', body:'Haenyeo dive without oxygen tanks, harvest seafood by season, and pass their knowledge of the ocean from one generation to the next.', topic:'Haenyeo', status:'published' as const, author:'Jeju Editorial' },
  { title:'Yeongdeunggut and the arrival of the wind', slug:'yeongdeunggut-season-of-wind', excerpt:'Discover the ritual that welcomes the goddess of wind and carries the islanders’ hopes for safety.', body:'Yeongdeunggut is a distinctive spring ritual rooted in the beliefs of Jeju’s fishing communities.', topic:'Yeongdeunggut', status:'published' as const, author:'Min-ji Park' },
  { title:'Shingugan — between the seasons', slug:'shingugan-between-seasons', excerpt:'Why do Jeju islanders choose the days of Shingugan to repair their homes and move?', body:'In Jeju folklore, Shingugan is the period when the gods leave their posts to report to the heavens.', topic:'Shingugan', status:'review' as const, author:'Seo-yeon Kim' },
]

@Injectable()
export class ContentService {
  constructor(@Inject(DatabaseService) private readonly database:DatabaseService){ this.seedStarterContent(); this.database.connection.prepare("UPDATE contents SET author='Jeju Editorial' WHERE author='Jeju AI Editorial'").run() }
  findAll(status?:ContentStatus){const rows=(status?this.database.connection.prepare('SELECT * FROM contents WHERE status=? ORDER BY updated_at DESC').all(status):this.database.connection.prepare('SELECT * FROM contents ORDER BY updated_at DESC').all()) as ContentRow[];return rows.map(row=>this.toItem(row))}
  findPublished(){return (this.database.connection.prepare("SELECT * FROM contents WHERE status='published' ORDER BY updated_at DESC").all() as ContentRow[]).map(row=>this.toItem(row))}
  findPublishedBySlug(slug:string){const row=this.database.connection.prepare("SELECT * FROM contents WHERE slug=? AND status='published'").get(slug) as ContentRow|undefined;if(!row)throw new NotFoundException('Published article not found.');return this.toItem(row)}
  create(input:ContentInput){const id=crypto.randomUUID(),timestamp=now();try{this.database.connection.prepare('INSERT INTO contents (id,title,slug,excerpt,body,topic,status,author,cover_image_url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(id,input.title.trim(),input.slug.trim(),input.excerpt.trim(),input.body.trim(),input.topic.trim(),input.status,input.author.trim(),input.coverImageUrl?.trim()||'',timestamp,timestamp);return this.get(id)}catch(error){this.handleConstraint(error)}}
  update(id:string,input:Partial<ContentInput>){const current=this.get(id),next={...current,...input},timestamp=now();try{this.database.connection.prepare('UPDATE contents SET title=?,slug=?,excerpt=?,body=?,topic=?,status=?,author=?,cover_image_url=?,updated_at=? WHERE id=?').run(next.title.trim(),next.slug.trim(),next.excerpt.trim(),next.body.trim(),next.topic.trim(),next.status,next.author.trim(),next.coverImageUrl.trim(),timestamp,id);return this.get(id)}catch(error){this.handleConstraint(error)}}
  remove(id:string){this.get(id);this.database.connection.prepare('DELETE FROM contents WHERE id=?').run(id);return{ok:true,id}}
  private get(id:string){const row=this.database.connection.prepare('SELECT * FROM contents WHERE id=?').get(id) as ContentRow|undefined;if(!row)throw new NotFoundException('Content not found.');return this.toItem(row)}
  private toItem(row:ContentRow):ContentItem{return{id:row.id,title:row.title,slug:row.slug,excerpt:row.excerpt,body:row.body,topic:row.topic,status:row.status,author:row.author,coverImageUrl:row.cover_image_url||'',updatedAt:row.updated_at}}
  private seedStarterContent(){const count=this.database.connection.prepare('SELECT COUNT(*) count FROM contents').get() as{count:number};if(count.count)return;for(const item of starterContent){const id=crypto.randomUUID(),timestamp=now();this.database.connection.prepare('INSERT INTO contents (id,title,slug,excerpt,body,topic,status,author,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,item.title,item.slug,item.excerpt,item.body,item.topic,item.status,item.author,timestamp,timestamp)}}
  private handleConstraint(error:unknown):never{if(error instanceof Error&&error.message.includes('contents.slug'))throw new ConflictException('This content slug already exists.');throw error}
}
