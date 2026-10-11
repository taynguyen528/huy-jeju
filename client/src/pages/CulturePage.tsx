import { useEffect, useState } from 'react'
import { ArrowUpRight, BookOpen, CalendarDays, Search, Waves } from 'lucide-react'
import { SegmentedControl, TextInput } from '@mantine/core'
import { getPublicContent } from '../api'
import type { ContentItem } from '../types'
import EditorialLayout from '../components/EditorialLayout'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'

const firstImage = (html: string) => html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]

export default function CulturePage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [error, setError] = useState('')
  const [query,setQuery]=useState(''); const [topic,setTopic]=useState('all')
  const { locale } = useI18n()

  useEffect(() => { setItems([]); setError(''); void getPublicContent(locale).then(setItems).catch((reason: Error) => setError(reason.message)) }, [locale])

  return <EditorialLayout>
    <main className="culture-main">
      <section className="culture-hero">
        <div><span className="eyebrow"><BookOpen size={15} /> CULTURE JOURNAL</span><h1>Những câu chuyện<br />làm nên <em>Jeju.</em></h1></div>
        <p>Từ nhịp thở của Haenyeo đến mùa gió Yeongdeunggut — khám phá hòn đảo qua ký ức, nghi lễ và đời sống của người bản địa.</p>
      </section>
      {error && <div className="content-error">{error}</div>}
      <section className="journal-tools"><TextInput value={query} onChange={event=>setQuery(event.currentTarget.value)} leftSection={<Search size={16}/>} placeholder="Tìm bài viết, tác giả, chủ đề…" radius="xl"/><SegmentedControl value={topic} onChange={setTopic} data={[{label:'Tất cả',value:'all'},{label:'Haenyeo',value:'Haenyeo'},{label:'Yeongdeunggut',value:'Yeongdeunggut'},{label:'Shingugan',value:'Shingugan'}]} /></section>
      <section className="article-grid">
        {items.filter(item=>(topic==='all'||item.topic.toLowerCase().includes(topic.toLowerCase()))&&`${item.title} ${item.excerpt} ${item.author}`.toLowerCase().includes(query.toLowerCase())).map((item, index) => <article className={index === 0 ? 'article-card featured' : 'article-card'} key={item.id}>
          <div className={`article-art ${item.coverImageUrl || firstImage(item.body) ? 'has-cover' : ''}`}>{item.coverImageUrl || firstImage(item.body) ? <img src={item.coverImageUrl || firstImage(item.body)} alt={`Ảnh bìa ${item.title}`} /> : <><span>{String(index + 1).padStart(2, '0')}</span><Waves /></>}</div>
          <div className="article-copy"><span className="topic">{item.topic}</span>{item.translationFallback&&<span className="translation-fallback">Bản tiếng Việt</span>}<h2>{item.title}</h2><p>{item.excerpt}</p><div className="article-meta"><span><CalendarDays size={14} /> {new Date(item.updatedAt).toLocaleDateString(locale==='en'?'en-US':locale==='ko'?'ko-KR':'vi-VN')}</span><span>{item.author}</span></div><Link className="article-read-link" to={`/van-hoa/${item.slug}`}>Đọc câu chuyện <ArrowUpRight size={16} /></Link></div>
        </article>)}
        {!error && !items.length && <p>Đang tải nội dung…</p>}
      </section>
    </main>
  </EditorialLayout>
}
