import { createLazyMemo } from '@solid-primitives/memo'
import { makePersisted } from '@solid-primitives/storage'
import { Accessor, JSX, createContext, createSignal, useContext } from 'solid-js'
import getShoutBySlug from '~/graphql/query/core/article-load'
import loadShoutsByQuery from '~/graphql/query/core/articles-load-by'
import loadShoutsFeed from '~/graphql/query/core/articles-load-feed'
import loadShoutsSearchQuery from '~/graphql/query/core/articles-load-search'
import {
  Author,
  LoadShoutsOptions,
  QueryLoad_Shouts_SearchArgs,
  Shout,
  Topic,
} from '~/graphql/schema/core.gen'
import { byStat } from '../utils/sortby'
import { useGraphQL } from './graphql'

export const PRERENDERED_ARTICLES_COUNT = 5

type FeedContextType = {
  sortedFeed: Accessor<Shout[]>
  articleEntities: Accessor<{ [articleSlug: string]: Shout }>
  topFeed: Accessor<Shout[]>
  topMonthFeed: Accessor<Shout[]>
  feedByAuthor: Accessor<{ [authorSlug: string]: Shout[] }>
  feedByTopic: Accessor<{ [topicSlug: string]: Shout[] }>
  feedByLayout: Accessor<{ [layout: string]: Shout[] }>
  topViewedFeed: Accessor<Shout[]>
  topCommentedFeed: Accessor<Shout[]>
  addFeed: (articles: Shout[]) => void
  loadShout: (slug: string) => Promise<void>
  loadShouts: (options: LoadShoutsOptions) => Promise<{ hasMore: boolean; newShouts: Shout[] }>
  loadMyFeed: (options: LoadShoutsOptions) => Promise<{ hasMore: boolean; newShouts: Shout[] }>
  loadShoutsSearch: (
    options: QueryLoad_Shouts_SearchArgs,
  ) => Promise<{ hasMore: boolean; newShouts: Shout[] }>
  resetSortedFeed: () => void
  loadTopMonthFeed: () => Promise<void>
  loadTopFeed: () => Promise<void>
  seen: Accessor<{ [slug: string]: number }>
  addSeen: (slug: string) => void
}

const FeedContext = createContext<FeedContextType>({} as FeedContextType)

export const useFeed = () => useContext(FeedContext)

export const FeedProvider = (props: { children: JSX.Element }) => {
  const [sortedFeed, setSortedFeed] = createSignal<Shout[]>([])
  const [articleEntities, setArticleEntities] = createSignal<{ [articleSlug: string]: Shout }>({})
  const [topFeed, setTopFeed] = createSignal<Shout[]>([])
  const [topMonthFeed, setTopMonthFeed] = createSignal<Shout[]>([])
  const [feedByLayout, _setFeedByLayout] = createSignal<{ [layout: string]: Shout[] }>({})
  const { query } = useGraphQL()
  const [seen, setSeen] = makePersisted(createSignal<{ [slug: string]: number }>({}), {
    name: 'discoursio-seen',
  })

  const addSeen = async (slug: string) => {
    setSeen((prev) => {
      const newSeen = { ...prev, [slug]: Date.now() }
      return newSeen
    })
  }

  // Memoized articles grouped by author
  const feedByAuthor = createLazyMemo(() => {
    return Object.values(articleEntities()).reduce(
      (acc, article: Shout) => {
        article.authors?.forEach((author: Author | null) => {
          if (!acc[author?.slug || '']) {
            acc[author?.slug || ''] = []
          }
          acc[author?.slug || ''].push(article)
        })
        return acc
      },
      {} as { [authorSlug: string]: Shout[] },
    )
  })

  // Memoized articles grouped by topic
  const feedByTopic = createLazyMemo(() => {
    return Object.values(articleEntities()).reduce(
      (acc, article: Shout) => {
        article.topics?.forEach((topic: Topic | null) => {
          if (!acc[topic?.slug || '']) {
            acc[topic?.slug || ''] = []
          }
          acc[topic?.slug || ''].push(article)
        })
        return acc
      },
      {} as { [topicSlug: string]: Shout[] },
    )
  })

  // Memoized top viewed articles
  const topViewedFeed = createLazyMemo(() => {
    const result = Object.values(articleEntities())
    // @ts-ignore
    result.sort(byStat('viewed'))
    return result
  })

  // Memoized top commented articles
  const topCommentedFeed = createLazyMemo(() => {
    const result = Object.values(articleEntities())
    // @ts-ignore
    result.sort(byStat('commented'))
    return result
  })

  // Add articles to the articleEntities and sortedFeed state
  const addFeed = (articles: Shout[]) => {
    const newArticleEntities = articles.reduce(
      (acc, article) => {
        if (!acc[article.slug]) {
          acc[article.slug] = article
        }
        return acc
      },
      {} as { [articleSlug: string]: Shout },
    )

    setArticleEntities((prevArticleEntities) => ({
      ...prevArticleEntities,
      ...newArticleEntities,
    }))

    setSortedFeed((prevSortedFeed) => [...prevSortedFeed, ...articles])
  }

  // Load a single shout by slug and update the articleEntities and sortedFeed state
  const loadShout = async (slug: string): Promise<void> => {
    const resp = await query(getShoutBySlug, { slug }).toPromise()
    if (!resp) return
    const newArticle = resp?.data?.get_shout as Shout
    addFeed([newArticle])
    const newArticleIndex = sortedFeed().findIndex((s) => s.id === newArticle.id)
    if (newArticleIndex >= 0) {
      const newSortedFeed = [...sortedFeed()]
      newSortedFeed[newArticleIndex] = articleEntities()?.[newArticle?.slug || '']
      setSortedFeed(newSortedFeed)
    }
  }

  // Load shouts based on the provided options and update the articleEntities and sortedFeed state
  const loadShoutsBy = async (
    options: LoadShoutsOptions,
  ): Promise<{ hasMore: boolean; newShouts: Shout[] }> => {
    const resp = await query(loadShoutsByQuery, { options }).toPromise()
    const result = resp?.data?.load_shouts_by || []
    const hasMore = result.length !== options.limit + 1 && result.length !== 0

    if (hasMore) {
      result.splice(-1)
    }

    addFeed(result)

    return { hasMore, newShouts: result }
  }

  // Load the user's feed based on the provided options and update the articleEntities and sortedFeed state
  const loadMyFeed = async (
    options: LoadShoutsOptions,
  ): Promise<{ hasMore: boolean; newShouts: Shout[] }> => {
    if (!options.limit) options.limit = 0
    options.limit += 1
    const resp = await query(loadShoutsFeed, options).toPromise()
    const result = resp?.data?.load_shouts_feed
    const hasMore = result.length === options.limit + 1

    if (hasMore) {
      resp.data.splice(-1)
    }

    addFeed(resp.data || [])

    return { hasMore, newShouts: resp.data.load_shouts_by }
  }

  // Load shouts based on the search query and update the articleEntities and sortedFeed state
  const loadShoutsSearch = async (
    options: QueryLoad_Shouts_SearchArgs,
  ): Promise<{ hasMore: boolean; newShouts: Shout[] }> => {
    options.limit = options?.limit || 0 + 1
    const resp = await query(loadShoutsSearchQuery, options).toPromise()
    const result = resp?.data?.load_shouts_search || []
    const hasMore = result.length === (options?.limit || 0) + 1

    if (hasMore) {
      result.splice(-1)
    }

    addFeed(result)

    return { hasMore, newShouts: result }
  }

  // Reset the sortedFeed state
  const resetSortedFeed = () => {
    setSortedFeed([])
  }

  // Load the top articles from the last month and update the topMonthFeed state
  const loadTopMonthFeed = async (): Promise<void> => {
    const daysago = Date.now() - 30 * 24 * 60 * 60 * 1000
    const after = Math.floor(daysago / 1000)
    const options: LoadShoutsOptions = {
      filters: {
        featured: true,
        after,
      },
      order_by: 'likes_stat',
      limit: 10,
    }
    const resp = await query(loadShoutsByQuery, options).toPromise()
    const result = resp?.data?.load_shouts_by || []
    addFeed(result)
    setTopMonthFeed(result)
  }
  // Load the top articles and update the topFeed state
  const loadTopFeed = async (): Promise<void> => {
    const options: LoadShoutsOptions = {
      filters: { featured: true },
      order_by: 'likes_stat',
      limit: 10,
    }
    const resp = await query(loadShoutsByQuery, options).toPromise()
    const result = resp?.data?.load_shouts_by || []
    addFeed(result)
    setTopFeed(result)
  }

  return (
    <FeedContext.Provider
      value={{
        sortedFeed,
        articleEntities,
        topFeed,
        topMonthFeed,
        feedByAuthor,
        feedByTopic,
        feedByLayout,
        topViewedFeed,
        topCommentedFeed,
        addFeed,
        loadShout,
        loadShouts: loadShoutsBy,
        loadMyFeed,
        loadShoutsSearch,
        resetSortedFeed,
        loadTopMonthFeed,
        loadTopFeed,
        seen,
        addSeen,
      }}
    >
      {props.children}
    </FeedContext.Provider>
  )
}
