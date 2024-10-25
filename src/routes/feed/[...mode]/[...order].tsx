import { RouteDefinition, RouteSectionProps, useSearchParams } from '@solidjs/router'
import { Client } from '@urql/core'
import { createEffect, createMemo } from 'solid-js'

import { AUTHORS_PER_PAGE } from '~/components/Views/AllAuthorsView'
import { FeedProps, FeedView } from '~/components/Views/FeedView'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { PageLayout } from '~/components/_shared/PageLayout'
import { SHOUTS_PER_PAGE, useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { useSession } from '~/context/session'
import { useTopics } from '~/context/topics'
import {
  loadCoauthoredShouts,
  loadDiscussedShouts,
  loadFollowedShouts
} from '~/graphql/api/private'

import { loadShouts } from '~/graphql/api/public'
import { loadTopics } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'
import { FromPeriod, getFromDate } from '~/lib/fromPeriod'

const privateFeeds = {
  followed: loadFollowedShouts,
  discussed: loadDiscussedShouts,
  coauthored: loadCoauthoredShouts
}

const fetchTopics = async () => {
  const topicsFetcher = loadTopics()
  return await topicsFetcher()
}

export const route = {
  load: async () => {
    return {
      topics: await fetchTopics(),
      shouts: await loadShouts({ limit: SHOUTS_PER_PAGE })
    }
  }
} satisfies RouteDefinition

export type FeedSearchParams = { period?: FromPeriod }

export default (props: RouteSectionProps<{ shouts: Shout[]; topics: Topic[] }>) => {
  const [searchParams] = useSearchParams<FeedSearchParams>() // ?period=month
  const { t } = useLocalize()
  const { setFeed, feed } = useFeed()
  const { client, session } = useSession()

  // preloaded all topics
  const { addTopics, sortedTopics } = useTopics()
  createEffect(() => {
    !sortedTopics() && props.data.topics && addTopics(props.data.topics)
  })

  // /feed/:mode: all | featured | followed | discussed | coauthored | unrated
  const mode = createMemo(() => props.params.mode || 'all')

  // /feed/:mode/:order: recent | hot | likes
  const order = createMemo(() => {
    return (
      (['recent', 'hot', 'likes'].includes(props.params.order)
        ? props.params.order === 'hot'
          ? 'last_comment'
          : props.params.order
        : 'created_at') || 'created_at'
    )
  })

  // load more feed
  const loadMoreShouts = async (offset?: number) => {
    const gqlHandler = privateFeeds[mode() as keyof typeof privateFeeds]

    // /feed/:mode:/:order: - select order setting
    const options: LoadShoutsOptions = {
      limit: 20,
      offset,
      order_by: order()
    }

    // ?period=month - time period filter
    if (searchParams?.period) {
      const period = searchParams?.period || 'month'
      options.filters = { after: getFromDate(period as FromPeriod) }
    }
    if (!client()) {
      throw new Error('API client not connected')
    }
    const shoutsLoader = session()?.access_token
      ? gqlHandler?.(client() as Client, options)
      : loadShouts(options)
    const loaded = await shoutsLoader?.()
    loaded && setFeed((prev: Shout[]) => [...prev, ...loaded] as Shout[])
    return (loaded || []) as LoadMoreItems
  }

  return (
    <PageLayout
      withPadding={true}
      title={`${t('Discours')} :: ${t('Feed')}`}
      key="feed"
      desc="Independent media project about culture, science, art and society with horizontal editing"
    >
      <LoadMoreWrapper loadFunction={loadMoreShouts} pageSize={AUTHORS_PER_PAGE}>
        <ReactionsProvider>
          <FeedView mode={(mode() || 'all') as FeedProps['mode']} order={order() as FeedProps['order']} />
        </ReactionsProvider>
      </LoadMoreWrapper>
    </PageLayout>
  )
}
