import { type RouteDefinition, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Suspense, createEffect} from 'solid-js'
import { useTopics } from '~/context/topics'
import { Topic } from '~/graphql/schema/core.gen'
import { loadTopics } from '~/lib/api'
import { AllTopics } from '../components/Views/AllTopics'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'

const fetchData = async () => {
  const topicsFetcher = loadTopics()
  return await topicsFetcher()
}

export const route = { load: loadTopics } satisfies RouteDefinition

export default function AllTopicsPage(props: RouteSectionProps<{ topics: Topic[] }>) {
  const { t } = useLocalize()
  const topics = createAsync<Topic[]>(async () => props.data.topics || (await fetchData()) || [])
  const { addTopics } = useTopics()
  createEffect(() => addTopics(topics()||[]))
  return (
    <PageLayout withPadding={true} title={`${t('Discours')}:${t('All topics')}`}>
      <ReactionsProvider>
        <Suspense fallback={<Loading />}>
          <AllTopics topics={topics() || []} />
        </Suspense>
      </ReactionsProvider>
    </PageLayout>
  )
}
