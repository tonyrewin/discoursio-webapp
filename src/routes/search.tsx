import { RouteSectionProps, action } from '@solidjs/router'
import { Show, Suspense, createEffect, createSignal, onCleanup } from 'solid-js'

import { QueryLoad_Shouts_SearchArgs, SearchResult } from '~/graphql/schema/core.gen'
import { loadShoutsSearch } from '~/lib/api'
import { SearchView } from '../components/Views/Search'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'

const fetchSearchResult = async ({ text, limit, offset }: QueryLoad_Shouts_SearchArgs) => {
  if (!text.trim()) return () => [] as SearchResult[]
  return await loadShoutsSearch({ text, limit, offset })
}

export const SearchPage = (props: RouteSectionProps<{ params: Record<string, string> }>) => {
  const { t } = useLocalize()
  const [isLoaded, setIsLoaded] = createSignal(false)
  const [hasSearched, setHasSearched] = createSignal(false)
  const [searchResults, setSearchResults] = createSignal<SearchResult[]>([])

  createEffect(async () => {
    if (props.params.q?.trim()) {
      try {
        console.debug('[routes.search] query:', props.params.q)
        const searchAction = action(async (text) => {
          if (!text.trim()) return { search: () => [] as SearchResult[], query: text }
          const search = await fetchSearchResult({ text, limit: 50, offset: 0 })
          return { search, query: text }
        })
        const { search: searchLoader } = await searchAction(props.params.q)
        const results = await searchLoader()
        setSearchResults((results || []) as SearchResult[])
        setHasSearched(true)
      } catch (error) {
        console.error('Error loading search results:', error)
      } finally {
        setIsLoaded(true)
      }
    }
  })

  onCleanup(() => {
    setHasSearched(false)
    setSearchResults([])
  })

  return (
    <PageLayout title={t('Search')}>
      <ReactionsProvider>
        <Suspense fallback={<Loading />}>
          <Show when={isLoaded()} fallback={<Loading />}>
            <Show
              when={searchResults().length > 0}
              fallback={
                <Show when={hasSearched()} fallback={<div>{t('Enter your search query')}</div>}>
                  <div>{t('No results found')}</div>
                </Show>
              }
            >
              <SearchView results={searchResults() as SearchResult[]} query={props.params.q} />
            </Show>
          </Show>
        </Suspense>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = SearchPage
