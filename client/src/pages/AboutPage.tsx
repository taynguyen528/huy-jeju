import { Card, SimpleGrid, ThemeIcon } from '@mantine/core'
import { Bot, Eye, HeartHandshake, Sparkles } from 'lucide-react'
import EditorialLayout from '../components/EditorialLayout'

const pillars=[
  {icon:Eye,title:'Tầm nhìn',body:'Trở thành không gian kể chuyện Jeju đáng tin cậy, nơi dữ liệu địa phương và công nghệ hỗ trợ một cách du lịch sâu sắc hơn.'},
  {icon:HeartHandshake,title:'Sứ mệnh',body:'Kết nối du khách với văn hóa Haenyeo, nghi lễ, cộng đồng và cảnh quan núi lửa bằng nội dung có nguồn.'},
  {icon:Bot,title:'AI có trách nhiệm',body:'Taewak cá nhân hóa lịch trình theo thời gian, sở thích, ngân sách và nhịp độ; người dùng luôn cần kiểm tra thông tin vận hành.'},
  {icon:Sparkles,title:'Giá trị cốt lõi',body:'Tôn trọng bản địa, kể chuyện chân thực, thiết kế dễ tiếp cận và ưu tiên trải nghiệm bền vững.'},
]
export default function AboutPage(){return <EditorialLayout><main className="about-page"><section className="about-hero"><span>ABOUT JEJU · 2026</span><h1>Technology with<br/><em>island memory.</em></h1><p>JEJU là một tạp chí du lịch kết hợp trợ lý lập lịch trình, được xây dựng để giúp du khách hiểu Jeju trước khi đặt chân đến hòn đảo.</p></section><SimpleGrid cols={{base:1,sm:2}} spacing="xl" className="about-grid">{pillars.map(({icon:Icon,title,body})=><Card key={title} padding="xl" radius="xl" withBorder><ThemeIcon size={52} radius="xl" color="pink" variant="light"><Icon/></ThemeIcon><h2>{title}</h2><p>{body}</p></Card>)}</SimpleGrid></main></EditorialLayout>}
