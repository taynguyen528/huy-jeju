import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service.js'
import type { ContentInput, ContentItem, ContentLocale, ContentStatus, ContentTranslation } from './content.types.js'

const now = () => new Date().toISOString()
const locales: ContentLocale[] = ['vi', 'en', 'ko']
type ContentRow = { id:string; title:string; slug:string; excerpt:string; body:string; topic:string; status:ContentStatus; author:string; cover_image_url:string; created_at:string; updated_at:string }
type TranslationRow = { locale:ContentLocale; title:string; excerpt:string; body:string; translation_status:'draft'|'reviewed' }

const starterContent = [
  { title:'Haenyeo — những người phụ nữ của biển', slug:'haenyeo-nguoi-phu-nu-cua-bien', excerpt:'Câu chuyện về cộng đồng nữ thợ lặn đã gìn giữ nhịp sống ven biển Jeju qua nhiều thế hệ.', body:'Haenyeo lặn biển mà không dùng bình dưỡng khí, thu hoạch hải sản theo mùa và trao truyền tri thức về đại dương qua nhiều thế hệ.', topic:'Haenyeo', status:'published' as const, author:'Jeju Editorial' },
  { title:'Yeongdeunggut và lời chào mùa gió', slug:'yeongdeunggut-mua-gio', excerpt:'Khám phá nghi lễ chào đón nữ thần gió và ước vọng bình an của ngư dân trên đảo.', body:'Yeongdeunggut là một nghi lễ mùa xuân đặc trưng, gắn với niềm tin của cộng đồng ngư dân Jeju.', topic:'Yeongdeunggut', status:'published' as const, author:'Min-ji Park' },
  { title:'Shingugan — khoảng thời gian chuyển mùa', slug:'shingugan-chuyen-mua', excerpt:'Vì sao người Jeju chọn những ngày Shingugan để sửa nhà và chuyển nơi ở?', body:'Trong quan niệm dân gian Jeju, Shingugan là khoảng thời gian các vị thần rời vị trí để báo cáo với thiên đình.', topic:'Shingugan', status:'review' as const, author:'Seo-yeon Kim' },
]

@Injectable()
export class ContentService {
  constructor(@Inject(DatabaseService) private readonly database:DatabaseService){ this.seedStarterContent(); this.migrateVietnameseTranslations(); this.database.connection.prepare("UPDATE contents SET author='Jeju Editorial' WHERE author='Jeju AI Editorial'").run() }

  findAll(status?:ContentStatus){
    const rows=(status?this.database.connection.prepare('SELECT * FROM contents WHERE status=? ORDER BY updated_at DESC').all(status):this.database.connection.prepare('SELECT * FROM contents ORDER BY updated_at DESC').all()) as ContentRow[]
    return rows.map(row=>this.toAdminItem(row))
  }
  findPublished(locale:ContentLocale='vi'){ return (this.database.connection.prepare("SELECT * FROM contents WHERE status='published' ORDER BY updated_at DESC").all() as ContentRow[]).map(row=>this.toPublicItem(row,locale)) }
  findPublishedBySlug(slug:string,locale:ContentLocale='vi'){
    const row=this.database.connection.prepare("SELECT * FROM contents WHERE slug=? AND status='published'").get(slug) as ContentRow|undefined
    if(!row) throw new NotFoundException('Không tìm thấy bài viết đã xuất bản.')
    return this.toPublicItem(row,locale)
  }
  create(input:ContentInput){
    const vi=input.translations.vi!; const id=crypto.randomUUID(); const timestamp=now()
    try { this.database.connection.transaction(()=>{
      this.database.connection.prepare('INSERT INTO contents (id,title,slug,excerpt,body,topic,status,author,cover_image_url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(id,vi.title.trim(),input.slug.trim(),vi.excerpt.trim(),vi.body.trim(),input.topic.trim(),input.status,input.author.trim(),input.coverImageUrl?.trim()||'',timestamp,timestamp)
      this.saveTranslations(id,input.translations,timestamp)
    })(); return this.getAdmin(id) } catch(error){ this.handleConstraint(error) }
  }
  update(id:string,input:Partial<ContentInput>){
    const current=this.getAdmin(id); const translations={...(current.translations||{}),...(input.translations||{})}; const vi=translations.vi!
    const next={slug:input.slug??current.slug,topic:input.topic??current.topic,status:input.status??current.status,author:input.author??current.author,coverImageUrl:input.coverImageUrl??current.coverImageUrl}; const timestamp=now()
    try { this.database.connection.transaction(()=>{
      this.database.connection.prepare('UPDATE contents SET title=?,slug=?,excerpt=?,body=?,topic=?,status=?,author=?,cover_image_url=?,updated_at=? WHERE id=?').run(vi.title.trim(),next.slug.trim(),vi.excerpt.trim(),vi.body.trim(),next.topic.trim(),next.status,next.author.trim(),next.coverImageUrl.trim(),timestamp,id)
      if(input.translations) this.saveTranslations(id,input.translations,timestamp)
    })(); return this.getAdmin(id) } catch(error){ this.handleConstraint(error) }
  }
  remove(id:string){this.getAdmin(id);this.database.connection.prepare('DELETE FROM contents WHERE id=?').run(id);return{ok:true,id}}

  private getAdmin(id:string){const row=this.database.connection.prepare('SELECT * FROM contents WHERE id=?').get(id) as ContentRow|undefined;if(!row)throw new NotFoundException('Không tìm thấy nội dung.');return this.toAdminItem(row)}
  private translations(id:string){
    const rows=this.database.connection.prepare('SELECT locale,title,excerpt,body,translation_status FROM content_translations WHERE content_id=?').all(id) as TranslationRow[]
    return Object.fromEntries(rows.map(row=>[row.locale,{title:row.title,excerpt:row.excerpt,body:row.body,translationStatus:row.translation_status}])) as Partial<Record<ContentLocale,ContentTranslation>>
  }
  private toAdminItem(row:ContentRow):ContentItem{const translations=this.translations(row.id);const vi=translations.vi!;return{id:row.id,slug:row.slug,topic:row.topic,status:row.status,author:row.author,coverImageUrl:row.cover_image_url||'',updatedAt:row.updated_at,title:vi.title,excerpt:vi.excerpt,body:vi.body,locale:'vi',requestedLocale:'vi',translationFallback:false,translations}}
  private toPublicItem(row:ContentRow,requestedLocale:ContentLocale):ContentItem{const translations=this.translations(row.id);const requested=translations[requestedLocale];const usable=requestedLocale==='vi'||(requested?.translationStatus==='reviewed'&&Boolean(requested.title&&requested.body));const selected=usable&&requested?requested:translations.vi!;const locale=(usable&&requested?requestedLocale:'vi') as ContentLocale;return{id:row.id,slug:row.slug,topic:row.topic,status:row.status,author:row.author,coverImageUrl:row.cover_image_url||'',updatedAt:row.updated_at,title:selected.title,excerpt:selected.excerpt,body:selected.body,locale,requestedLocale,translationFallback:locale!==requestedLocale}}
  private saveTranslations(id:string,translations:Partial<Record<ContentLocale,ContentTranslation>>,timestamp:string){
    const upsert=this.database.connection.prepare(`INSERT INTO content_translations (content_id,locale,title,excerpt,body,translation_status,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(content_id,locale) DO UPDATE SET title=excluded.title,excerpt=excluded.excerpt,body=excluded.body,translation_status=excluded.translation_status,updated_at=excluded.updated_at`)
    const remove=this.database.connection.prepare('DELETE FROM content_translations WHERE content_id=? AND locale=?')
    for(const locale of locales){const value=translations[locale];if(!value)continue;if(locale!=='vi'&&!value.title.trim()&&!value.excerpt.trim()&&!value.body.trim()){remove.run(id,locale);continue}upsert.run(id,locale,value.title.trim(),value.excerpt.trim(),value.body.trim(),value.translationStatus||'draft',timestamp)}
  }
  private migrateVietnameseTranslations(){this.database.connection.prepare("INSERT OR IGNORE INTO content_translations (content_id,locale,title,excerpt,body,translation_status,updated_at) SELECT id,'vi',title,excerpt,body,'reviewed',updated_at FROM contents").run()}
  private seedStarterContent(){const count=this.database.connection.prepare('SELECT COUNT(*) count FROM contents').get() as{count:number};if(count.count)return;for(const item of starterContent){const id=crypto.randomUUID(),timestamp=now();this.database.connection.prepare('INSERT INTO contents (id,title,slug,excerpt,body,topic,status,author,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,item.title,item.slug,item.excerpt,item.body,item.topic,item.status,item.author,timestamp,timestamp)}}
  private handleConstraint(error:unknown):never{if(error instanceof Error&&error.message.includes('contents.slug'))throw new ConflictException('Slug nội dung đã tồn tại.');throw error}
}
