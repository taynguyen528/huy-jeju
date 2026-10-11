import { useEffect, useMemo, useState } from 'react'
import { Alert, Loader } from '@mantine/core'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import DOMPurify from 'dompurify'
import { Link, useParams } from 'react-router-dom'
import EditorialLayout from '../components/EditorialLayout'
import { getPublicContentBySlug } from '../api'
import type { ContentItem } from '../types'
import { useI18n } from '../i18n/I18nContext'

export default function ArticleDetailPage() {
  const { slug = '' } = useParams()
  const [item, setItem] = useState<ContentItem | null>(null)
  const [error, setError] = useState('')
  const { locale } = useI18n()
  useEffect(() => { setItem(null); setError(''); void getPublicContentBySlug(slug, locale).then(setItem).catch((reason: Error) => setError(reason.message)) }, [slug, locale])
  const safeBody = useMemo(() => DOMPurify.sanitize(item?.body || '', { USE_PROFILES: { html: true } }), [item?.body])

  return <EditorialLayout><main className="article-detail-page">
    <Link className="article-back" to="/van-hoa"><ArrowLeft size={16} /> Trở lại Culture Journal</Link>
    {error ? <Alert color="red">{error}</Alert> : !item ? <div className="article-loading"><Loader color="pink" /></div> : <article>
      {item.translationFallback&&<Alert color="blue" mb="lg">Bài viết chưa có bản dịch cho ngôn ngữ đã chọn. Hệ thống đang hiển thị bản tiếng Việt.</Alert>}
      {item.coverImageUrl && <figure className="article-cover"><img src={item.coverImageUrl} alt={`Ảnh bìa ${item.title}`} /></figure>}
      <header><span>{item.topic}</span><h1>{item.title}</h1><p>{item.excerpt}</p><div><span><CalendarDays size={14} /> {new Date(item.updatedAt).toLocaleDateString(locale==='en'?'en-US':locale==='ko'?'ko-KR':'vi-VN')}</span><span>{item.author}</span></div></header>
      <div className="article-body" dangerouslySetInnerHTML={{ __html: safeBody }} />
    </article>}
  </main></EditorialLayout>
}
