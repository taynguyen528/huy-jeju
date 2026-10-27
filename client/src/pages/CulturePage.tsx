import { useEffect, useState } from 'react'
import { ArrowUpRight, BookOpen, CalendarDays, Search, Waves } from 'lucide-react'
import { SegmentedControl, TextInput } from '@mantine/core'
import { getPublicContent } from '../api'
import type { ContentItem } from '../types'
import EditorialLayout from '../components/EditorialLayout'
import { Link } from 'react-router-dom'

const firstImage = (html: string) => html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]

export default function CulturePage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [error, setError] = useState('')
  const [query,setQuery]=useState(''); const [topic,setTopic]=useState('all')
  useEffect(() => { setItems([]); setError(''); void getPublicContent().then(setItems).catch((reason: Error) => setError(reason.message)) }, [])

  return <EditorialLayout>
    <main className="culture-main">
      <section className="culture-hero">
        <div><span className="eyebrow"><BookOpen size={15} /> CULTURE JOURNAL</span><h1>Stories that<br />shape <em>Jeju.</em></h1></div>
        <p>From the breath of the Haenyeo to the winds of Yeongdeunggut — discover the island through memory, ritual, and local life.</p>
      </section>
      {error && <div className="content-error">{error}</div>}
      <section className="journal-tools"><TextInput value={query} onChange={event=>setQuery(event.currentTarget.value)} leftSection={<Search size={16}/>} placeholder="Search articles, authors, or topics…" radius="xl"/><SegmentedControl value={topic} onChange={setTopic} data={[{label:'All',value:'all'},{label:'Haenyeo',value:'Haenyeo'},{label:'Yeongdeunggut',value:'Yeongdeunggut'},{label:'Shingugan',value:'Shingugan'}]} /></section>
      <section className="article-grid">
        {items.filter(item=>(topic==='all'||item.topic.toLowerCase().includes(topic.toLowerCase()))&&`${item.title} ${item.excerpt} ${item.author}`.toLowerCase().includes(query.toLowerCase())).map((item, index) => <article className={index === 0 ? 'article-card featured' : 'article-card'} key={item.id}>
          <div className={`article-art ${item.coverImageUrl || firstImage(item.body) ? 'has-cover' : ''}`}>{item.coverImageUrl || firstImage(item.body) ? <img src={item.coverImageUrl || firstImage(item.body)} alt={`${item.title} cover`} /> : <><span>{String(index + 1).padStart(2, '0')}</span><Waves /></>}</div>
          <div className="article-copy"><span className="topic">{item.topic}</span><h2>{item.title}</h2><p>{item.excerpt}</p><div className="article-meta"><span><CalendarDays size={14} /> {new Date(item.updatedAt).toLocaleDateString('en-US')}</span><span>{item.author}</span></div><Link className="article-read-link" to={`/van-hoa/${item.slug}`}>Read story <ArrowUpRight size={16} /></Link></div>
        </article>)}
        {!error && !items.length && <p>Loading stories…</p>}
      </section>
    </main>
  </EditorialLayout>
}
