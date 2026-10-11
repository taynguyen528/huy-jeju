import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ActionIcon, Alert, Button, Chip, Select, TextInput, Tooltip } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowUp,
  CalendarDays,
  ChevronRight,
  Compass,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Send,
  Save,
  WalletCards,
} from 'lucide-react'
import { saveItinerary, sendChatMessage } from '../api'
import type { ChatMessage, TripDraft } from '../types'
import EditorialLayout from '../components/EditorialLayout'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Annyeong! Mình là Taewak, trợ lý hành trình Jeju. Bạn muốn một chuyến đi thư giãn bên biển, khám phá văn hóa Haenyeo hay chinh phục Hallasan?',
}

const suggestions = [
  'Lịch trình Jeju 3 ngày cho cặp đôi',
  'Khám phá văn hóa Haenyeo',
  'Ăn gì gần Seongsan Ilchulbong?',
  'Lịch trình 5 ngày không cần thuê ô tô',
  'Một ngày trekking Hallasan an toàn',
  'Tour làng cổ và chợ truyền thống',
  'Gợi ý ngày mưa ở Jeju',
  'Tối ưu chuyến đi với ngân sách 1.500.000 KRW',
]

const interests = ['Văn hóa', 'Thiên nhiên', 'Ẩm thực', 'Biển', 'Mua sắm']

function PlannerPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [trip, setTrip] = useState<TripDraft>({
    destination: 'Jeju, Hàn Quốc',
    startDate: '',
    endDate: '',
    travelers: '2 người',
    interests: ['Văn hóa', 'Thiên nhiên'],
    pace: 'Cân bằng',
    transport: 'Xe buýt + taxi',
    budget: '1500000',
  })
  const abortRef = useRef<AbortController | null>(null)
  const latestMessageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [messages.length])

  const tripSummary = useMemo(() => {
    const dates = trip.startDate && trip.endDate ? `${trip.startDate} → ${trip.endDate}` : 'Chưa chọn ngày'
    return `${trip.destination} · ${dates}`
  }, [trip])

  const submit = async (event?: FormEvent, suggestion?: string) => {
    event?.preventDefault()
    const content = (suggestion ?? input).trim()
    if (!content || loading) return

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setSaveState('idle')
    setLoading(true)
    abortRef.current = new AbortController()

    try {
      const result = await sendChatMessage(nextMessages, trip, abortRef.current.signal)
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', content: result.message },
      ])
    } catch (requestError) {
      if ((requestError as Error).name !== 'AbortError') {
        setError((requestError as Error).message)
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const resetChat = () => {
    abortRef.current?.abort()
    setMessages([initialMessage])
    setError('')
    setLoading(false)
    setSaveState('idle')
  }

  const latestPlan = [...messages].reverse().find((message) => message.role === 'assistant' && message.id !== 'welcome')
  const saveCurrentPlan = async () => {
    if (!user) { navigate('/dang-nhap', { state: { from: '/lich-trinh' } }); return }
    if (!latestPlan || saveState === 'saving') return
    setError(''); setSaveState('saving')
    try { await saveItinerary(trip, latestPlan.content); setSaveState('saved') } catch (reason) { setError((reason as Error).message); setSaveState('idle') }
  }

  return (
    <EditorialLayout>
      <main className="planner-route">
        <div className="planner-heading reveal-up"><span>YOUR PRIVATE ITINERARY</span><h2>Plan less.<br /><em>feel more.</em></h2></div>

        <section className={`workspace ${panelCollapsed ? 'panel-collapsed' : ''}`} id="itinerary">
          <aside className="trip-panel">
            <div className="panel-heading">
              <div><span>BƯỚC 1</span><h2>Thông tin chuyến đi</h2></div>
              <Map size={24} />
            </div>

            <div className="trip-form-section trip-form-primary">
              <div className="trip-section-heading"><span>01</span><div><strong>Hành trình</strong><small>Địa điểm và thời gian dự kiến</small></div></div>
              <TextInput
                className="destination-input"
                label="Điểm đến"
                placeholder="Bạn muốn đi đâu?"
                value={trip.destination}
                onChange={(event) => setTrip({ ...trip, destination: event.currentTarget.value })}
                leftSection={<Compass size={17} />}
              />
              <div className="date-grid ui-date-grid">
              <DatePickerInput
                label="Ngày đi"
                placeholder="DD/MM/YYYY"
                value={trip.startDate || null}
                onChange={(value) => setTrip({ ...trip, startDate: value || '', endDate: trip.endDate && value && trip.endDate < value ? '' : trip.endDate })}
                minDate={new Date()}
                valueFormat="DD/MM/YYYY"
                leftSection={<CalendarDays size={16} />}
                clearable
              />
              <DatePickerInput
                label="Ngày về"
                placeholder="DD/MM/YYYY"
                value={trip.endDate || null}
                onChange={(value) => setTrip({ ...trip, endDate: value || '' })}
                minDate={trip.startDate || new Date()}
                valueFormat="DD/MM/YYYY"
                leftSection={<CalendarDays size={16} />}
                clearable
              />
              </div>
              <Select
                className="travelers-select"
                label="Số người"
                value={trip.travelers}
                onChange={(value) => setTrip({ ...trip, travelers: value || '2 người' })}
                data={['1 người', '2 người', '3–4 người', '5+ người']}
                allowDeselect={false}
                checkIconPosition="right"
              />
            </div>

            <div className="trip-form-section">
              <div className="trip-section-heading"><span>02</span><div><strong>Phong cách chuyến đi</strong><small>Điều chỉnh nhịp độ và chi phí</small></div></div>
              <div className="trip-preferences-grid">
                <Select label="Nhịp độ" value={trip.pace} onChange={(value) => setTrip({ ...trip, pace: value || 'Cân bằng' })} data={['Thư giãn', 'Cân bằng', 'Khám phá nhiều']} allowDeselect={false} />
                <Select label="Phương tiện" value={trip.transport} onChange={(value) => setTrip({ ...trip, transport: value || 'Xe buýt + taxi' })} data={['Xe buýt + taxi', 'Thuê ô tô', 'Taxi', 'Tour trọn gói']} allowDeselect={false} />
              </div>
              <TextInput className="budget-input" label="Tổng ngân sách dự kiến" description="Cho toàn bộ chuyến đi · đơn vị KRW" value={trip.budget ? Number(trip.budget).toLocaleString('vi-VN') : ''} onChange={(event) => setTrip({ ...trip, budget: event.currentTarget.value.replace(/\D/g, '') })} leftSection={<WalletCards size={16} />} rightSection={<span className="currency-mark">₩</span>} inputMode="numeric" placeholder="Ví dụ: 1.500.000" />
            </div>

            <div className="trip-form-section">
              <div className="trip-section-heading"><span>03</span><div><strong>Sở thích</strong><small>Chọn nhiều mục để AI cá nhân hóa</small></div></div>
              <fieldset>
                <legend className="sr-only">Bạn quan tâm</legend>
                <Chip.Group multiple value={trip.interests} onChange={(value) => setTrip({ ...trip, interests: value })}>
                  <div className="chips ui-chips">
                    {interests.map((item) => <Chip key={item} value={item} variant="outline">{item}</Chip>)}
                  </div>
                </Chip.Group>
              </fieldset>
            </div>

            <div className="trip-note">
              <CalendarDays size={20} />
              <div><strong>Chuyến đi của bạn</strong><span>{tripSummary}</span></div>
            </div>
          </aside>

          <section className="chat-card">
            <header className="chat-header">
              <div className="assistant-avatar">T</div>
              <div><h2>Taewak</h2><span><i /> Trợ lý lịch trình Jeju</span></div>
              <div className="chat-header-actions">
                <Button className="save-plan-button" variant="light" color="pink" leftSection={<Save size={16} />} disabled={!latestPlan || loading} loading={saveState === 'saving'} onClick={() => void saveCurrentPlan()}>{saveState === 'saved' ? 'Đã lưu' : 'Lưu lịch trình'}</Button>
                <Tooltip label={panelCollapsed ? 'Mở thông tin chuyến đi' : 'Thu gọn thông tin chuyến đi'}>
                  <ActionIcon className="panel-toggle" size={44} radius="xl" variant="outline" color="dark" onClick={() => setPanelCollapsed((value) => !value)} aria-label={panelCollapsed ? 'Mở thông tin chuyến đi' : 'Thu gọn thông tin chuyến đi'} aria-expanded={!panelCollapsed}>{panelCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</ActionIcon>
                </Tooltip>
                <Tooltip label="Bắt đầu lại">
                  <ActionIcon size={44} radius="xl" variant="outline" color="dark" onClick={resetChat} aria-label="Bắt đầu lại"><RotateCcw size={18} /></ActionIcon>
                </Tooltip>
              </div>
            </header>

            <div className="messages" aria-live="polite">
              {messages.map((message, index) => (
                <div key={message.id} ref={index === messages.length - 1 ? latestMessageRef : undefined} className={`message-row ${message.role}`}>
                  {message.role === 'assistant' && <div className="mini-avatar">T</div>}
                  <div className="message-bubble">
                    {message.role === 'assistant'
                      ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      : message.content}
                  </div>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="suggestions">
                  <span>Gợi ý để bắt đầu</span>
                  {suggestions.map((item) => <Button key={item} variant="subtle" color="dark" justify="space-between" rightSection={<ChevronRight size={16} />} onClick={() => void submit(undefined, item)}>{item}</Button>)}
                </div>
              )}
              {loading && <div className="message-row assistant"><div className="mini-avatar">T</div><div className="message-bubble typing"><i /><i /><i /></div></div>}
              {error && <div className="error-message">{error}</div>}
              {saveState === 'saved' && <Alert color="green" title="Đã lưu lịch trình">Bạn có thể xem lại nội dung này trong trang Tài khoản.</Alert>}
            </div>

            <form className="chat-input" onSubmit={(event) => void submit(event)}>
              <button type="button" className="add-button" aria-label="Thêm thông tin"><Plus size={20} /></button>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit() }
              }} placeholder="Hỏi Taewak về lịch trình Jeju..." rows={1} />
              <button className="send-button" disabled={!input.trim() || loading} aria-label="Gửi"><Send size={18} /></button>
            </form>
            <p className="ai-note">AI có thể mắc lỗi. Hãy kiểm tra giờ mở cửa và thông tin quan trọng trước chuyến đi.</p>
          </section>
        </section>

        <section className="next-step">
          <span>Tiếp theo</span><h2>Biến gợi ý thành lịch trình từng ngày</h2>
          <button>Khám phá tính năng <ArrowUp size={17} /></button>
        </section>

      </main>
    </EditorialLayout>
  )
}

export default PlannerPage
