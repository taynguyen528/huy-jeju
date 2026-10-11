import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Locale = 'vi' | 'en' | 'ko'
const messages = {
  vi: { 'nav.about':'Giới thiệu','nav.explore':'Khám phá','nav.planner':'Lịch trình','nav.culture':'Văn hóa Jeju','nav.login':'Đăng nhập','user.account':'Tài khoản','user.itineraries':'Lịch trình đã lưu','user.logout':'Đăng xuất','footer.mission':'Du lịch chậm hơn. Nhìn sâu hơn.\nGìn giữ những câu chuyện của Jeju.','footer.explore':'Khám phá','footer.journal':'Tạp chí','footer.rights':'BẢO LƯU MỌI QUYỀN','common.language':'Ngôn ngữ','common.menu':'Mở menu' },
  en: { 'nav.about':'About','nav.explore':'Explore','nav.planner':'Itinerary','nav.culture':'Jeju Culture','nav.login':'Sign in','user.account':'Account','user.itineraries':'Saved itineraries','user.logout':'Sign out','footer.mission':'Travel slower. Look deeper.\nPreserve the stories of Jeju.','footer.explore':'Explore','footer.journal':'Journal','footer.rights':'ALL RIGHTS RESERVED','common.language':'Language','common.menu':'Open menu' },
  ko: { 'nav.about':'소개','nav.explore':'제주 탐색','nav.planner':'여행 일정','nav.culture':'제주 문화','nav.login':'로그인','user.account':'내 계정','user.itineraries':'저장한 일정','user.logout':'로그아웃','footer.mission':'천천히 여행하고, 깊이 바라보며,\n제주의 이야기를 지켜갑니다.','footer.explore':'탐색','footer.journal':'저널','footer.rights':'모든 권리 보유','common.language':'언어','common.menu':'메뉴 열기' },
} as const
type MessageKey = keyof typeof messages.vi
type I18nValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: MessageKey) => string }
const I18nContext = createContext<I18nValue | null>(null)
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => { const saved = localStorage.getItem('jeju-locale'); return saved === 'en' || saved === 'ko' ? saved : 'vi' })
  const setLocale = (next: Locale) => { localStorage.setItem('jeju-locale', next); setLocaleState(next) }
  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t: (key) => messages[locale][key] }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
export function useI18n() { const value = useContext(I18nContext); if (!value) throw new Error('useI18n must be used inside I18nProvider'); return value }
