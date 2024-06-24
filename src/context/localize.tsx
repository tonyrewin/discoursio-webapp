import { useSearchParams } from '@solidjs/router'
import type { Accessor, JSX } from 'solid-js'
import { Show, createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js'

import { TimeAgo, type i18n, i18next, i18nextInit } from '~/lib/i18next'

i18nextInit()

type LocalizeContextType = {
  t: i18n['t']
  lang: Accessor<Language>
  setLang: (lang: Language) => void
  formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string
  formatTimeAgo: (date: Date) => string
}

export type Language = 'ru' | 'en'

const LocalizeContext = createContext<LocalizeContextType>({
  t: (s: string) => s,
} as LocalizeContextType)

export function useLocalize() {
  return useContext(LocalizeContext)
}

export const LocalizeProvider = (props: { children: JSX.Element }) => {
  const [lang, setLang] = createSignal<Language>(i18next.language === 'en' ? 'en' : 'ru')
  const [searchParams, changeSearchParams] = useSearchParams<Record<string, string>>()
  createEffect(() => {
    if (!(searchParams?.lng || localStorage.getItem('lng'))) {
      return
    }
    try {
      const lng: Language = searchParams?.lng === 'en' ? 'en' : 'ru'

      i18next.changeLanguage(lng)
      setLang(lng)
      if (searchParams?.lng) {
        changeSearchParams({ lng }, { replace: true })
      }
      localStorage?.setItem('lng', lng)
    } catch (e) {
      console.warn(e)
    }
  })

  const formatTime = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
    const opts = Object.assign(
      {},
      {
        hour: '2-digit',
        minute: '2-digit',
      },
      options,
    )

    return date.toLocaleTimeString(lang(), opts)
  }

  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
    const opts = Object.assign(
      {},
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      },
      options,
    )

    return date.toLocaleDateString(lang(), opts)
  }

  const timeAgo = createMemo(() => new TimeAgo(lang()))

  const formatTimeAgo = (date: Date) => timeAgo().format(date)

  const value: LocalizeContextType = {
    t: i18next.t,
    lang,
    setLang,
    formatTime,
    formatDate,
    formatTimeAgo,
  }

  return (
    <LocalizeContext.Provider value={value}>
      <Show when={lang()} keyed={true}>
        {props.children}
      </Show>
    </LocalizeContext.Provider>
  )
}
