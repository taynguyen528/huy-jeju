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
  MapPin,
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
import { ItineraryMap } from '../components/ItineraryMap'
import EditorialLayout from '../components/EditorialLayout'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Annyeong! I’m Taewak, your Jeju itinerary assistant. Would you like a relaxing coastal trip, a journey into Haenyeo culture, or a Hallasan adventure?',
}

const suggestions = [
  'A 3-day Jeju itinerary for couples',
  'Explore Haenyeo culture',
  'What should I eat near Seongsan Ilchulbong?',
  'A 5-day itinerary without a rental car',
  'A safe day hike on Hallasan',
  'A tour of historic villages and traditional markets',
  'Ideas for a rainy day in Jeju',
  'Plan a trip with a budget of KRW 1,500,000',
]

const interests = ['Culture', 'Nature', 'Food', 'Coast', 'Shopping']

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
    destination: 'Jeju, South Korea',
    startDate: '',
    endDate: '',
    travelers: '2 travelers',
    interests: ['Culture', 'Nature'],
    pace: 'Balanced',
    transport: 'Bus + taxi',
    budget: '1500000',
  })
  const abortRef = useRef<AbortController | null>(null)
  const latestMessageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [messages.length])

  const tripSummary = useMemo(() => {
    const dates = trip.startDate && trip.endDate ? `${trip.startDate} → ${trip.endDate}` : 'Dates not selected'
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
        { id: crypto.randomUUID(), role: 'assistant', content: result.message, days: result.days },
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
              <div><span>STEP 1</span><h2>Trip details</h2></div>
              <Map size={24} />
            </div>

            <div className="trip-form-section trip-form-primary">
              <div className="trip-section-heading"><span>01</span><div><strong>Journey</strong><small>Destination and travel dates</small></div></div>
              <TextInput
                className="destination-input"
                label="Destination"
                placeholder="Where would you like to go?"
                value={trip.destination}
                onChange={(event) => setTrip({ ...trip, destination: event.currentTarget.value })}
                leftSection={<Compass size={17} />}
              />
              <div className="date-grid ui-date-grid">
              <DatePickerInput
                label="Start date"
                placeholder="DD/MM/YYYY"
                value={trip.startDate || null}
                onChange={(value) => setTrip({ ...trip, startDate: value || '', endDate: trip.endDate && value && trip.endDate < value ? '' : trip.endDate })}
                minDate={new Date()}
                valueFormat="DD/MM/YYYY"
                leftSection={<CalendarDays size={16} />}
                clearable
              />
              <DatePickerInput
                label="End date"
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
                label="Travelers"
                value={trip.travelers}
                onChange={(value) => setTrip({ ...trip, travelers: value || '2 travelers' })}
                data={['1 traveler', '2 travelers', '3–4 travelers', '5+ travelers']}
                allowDeselect={false}
                checkIconPosition="right"
              />
            </div>

            <div className="trip-form-section">
              <div className="trip-section-heading"><span>02</span><div><strong>Travel style</strong><small>Adjust pace and costs</small></div></div>
              <div className="trip-preferences-grid">
                <Select label="Pace" value={trip.pace} onChange={(value) => setTrip({ ...trip, pace: value || 'Balanced' })} data={['Relaxed', 'Balanced', 'Packed']} allowDeselect={false} />
                <Select label="Transport" value={trip.transport} onChange={(value) => setTrip({ ...trip, transport: value || 'Bus + taxi' })} data={['Bus + taxi', 'Rental car', 'Taxi', 'Package tour']} allowDeselect={false} />
              </div>
              <TextInput className="budget-input" label="Estimated total budget" description="For the entire trip · KRW" value={trip.budget ? Number(trip.budget).toLocaleString('en-US') : ''} onChange={(event) => setTrip({ ...trip, budget: event.currentTarget.value.replace(/\D/g, '') })} leftSection={<WalletCards size={16} />} rightSection={<span className="currency-mark">₩</span>} inputMode="numeric" placeholder="Example: 1,500,000" />
            </div>

            <div className="trip-form-section">
              <div className="trip-section-heading"><span>03</span><div><strong>Interests</strong><small>Select several to personalize with AI</small></div></div>
              <fieldset>
                <legend className="sr-only">Your interests</legend>
                <Chip.Group multiple value={trip.interests} onChange={(value) => setTrip({ ...trip, interests: value })}>
                  <div className="chips ui-chips">
                    {interests.map((item) => <Chip key={item} value={item} variant="outline">{item}</Chip>)}
                  </div>
                </Chip.Group>
              </fieldset>
            </div>

            <div className="trip-note">
              <CalendarDays size={20} />
              <div><strong>Your trip</strong><span>{tripSummary}</span></div>
            </div>
          </aside>

          <section className="chat-card">
            <header className="chat-header">
              <div className="assistant-avatar">T</div>
              <div><h2>Taewak</h2><span><i /> Jeju itinerary assistant</span></div>
              <div className="chat-header-actions">
                <button className="save-plan-button" type="button" disabled={!latestPlan || loading || saveState === 'saving'} aria-busy={saveState === 'saving'} onClick={() => void saveCurrentPlan()}>
                  <Save size={16} aria-hidden="true" />
                  <span className="save-plan-label">{saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save itinerary'}</span>
                </button>
                <Tooltip label={panelCollapsed ? 'Show trip details' : 'Collapse trip details'}>
                  <ActionIcon className="panel-toggle" size={44} radius="xl" variant="outline" color="dark" onClick={() => setPanelCollapsed((value) => !value)} aria-label={panelCollapsed ? 'Show trip details' : 'Collapse trip details'} aria-expanded={!panelCollapsed}>{panelCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</ActionIcon>
                </Tooltip>
                <Tooltip label="Start over">
                  <ActionIcon size={44} radius="xl" variant="outline" color="dark" onClick={resetChat} aria-label="Start over"><RotateCcw size={18} /></ActionIcon>
                </Tooltip>
              </div>
            </header>

            <div className="messages" aria-live="polite">
              {messages.map((message, index) => (
                <div key={message.id} ref={index === messages.length - 1 ? latestMessageRef : undefined} className={`message-row ${message.role}`}>
                  {message.role === 'assistant' && <div className="mini-avatar">T</div>}
                  <div className="message-bubble">
                    {message.role === 'assistant'
                      ? <>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                          {Boolean(message.days?.length) && <section className="itinerary-places" aria-label="Main places by day">
                            <header><MapPin size={16}/><strong>Main places by day</strong></header>
                            {message.days?.map(day => <div key={day.day} className="itinerary-place-day">
                              <span>Day {day.day}</span>
                              <div>{day.places.map(place => <button type="button" key={`${place.order}-${place.name}`} onClick={() => setInput(`Tell me more about ${place.name}`)}>{place.order}. {place.name}</button>)}</div>
                            </div>)}
                            <ItineraryMap days={message.days || []} />
                          </section>}
                        </>
                      : message.content}
                  </div>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="suggestions">
                  <span>Ideas to get started</span>
                  {suggestions.map((item) => <Button key={item} variant="subtle" color="dark" justify="space-between" rightSection={<ChevronRight size={16} />} onClick={() => void submit(undefined, item)}>{item}</Button>)}
                </div>
              )}
              {loading && <div className="message-row assistant"><div className="mini-avatar">T</div><div className="message-bubble typing"><i /><i /><i /></div></div>}
              {error && <div className="error-message">{error}</div>}
              {saveState === 'saved' && <Alert color="green" title="Itinerary saved">You can review it from your Account page.</Alert>}
            </div>

            <form className="chat-input" onSubmit={(event) => void submit(event)}>
              <button type="button" className="add-button" aria-label="Add information"><Plus size={20} /></button>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit() }
              }} placeholder="Ask Taewak about your Jeju itinerary..." rows={1} />
              <button className="send-button" disabled={!input.trim() || loading} aria-label="Send"><Send size={18} /></button>
            </form>
            <p className="ai-note">AI can make mistakes. Verify opening hours and important details before your trip.</p>
          </section>
        </section>

        <section className="next-step">
          <span>UP NEXT</span><h2>Turn suggestions into a day-by-day itinerary</h2>
          <button>Explore the feature <ArrowUp size={17} /></button>
        </section>

      </main>
    </EditorialLayout>
  )
}

export default PlannerPage
