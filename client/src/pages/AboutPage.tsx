import { Card, SimpleGrid, ThemeIcon } from '@mantine/core'
import { Bot, Eye, HeartHandshake, Sparkles } from 'lucide-react'
import EditorialLayout from '../components/EditorialLayout'

const pillars=[
  {icon:Eye,title:'Vision',body:'To be a trusted space for Jeju stories, where local knowledge and technology support more meaningful travel.'},
  {icon:HeartHandshake,title:'Mission',body:'Connect travelers with Haenyeo culture, rituals, communities, and volcanic landscapes through sourced content.'},
  {icon:Bot,title:'Responsible AI',body:'Taewak personalizes itineraries by time, interests, budget, and pace; travelers should always verify operational details.'},
  {icon:Sparkles,title:'Core values',body:'Respect local communities, tell authentic stories, design for accessibility, and prioritize sustainable experiences.'},
]
export default function AboutPage(){return <EditorialLayout><main className="about-page"><section className="about-hero"><span>ABOUT JEJU · 2026</span><h1>Technology with<br/><em>island memory.</em></h1><p>JEJU is a travel journal with an itinerary assistant, built to help travelers understand Jeju before they set foot on the island.</p></section><SimpleGrid cols={{base:1,sm:2}} spacing="xl" className="about-grid">{pillars.map(({icon:Icon,title,body})=><Card key={title} padding="xl" radius="xl" withBorder><ThemeIcon size={52} radius="xl" color="pink" variant="light"><Icon/></ThemeIcon><h2>{title}</h2><p>{body}</p></Card>)}</SimpleGrid></main></EditorialLayout>}
