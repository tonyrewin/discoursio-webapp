import { clsx } from 'clsx'
import { Show, createEffect, createSignal, on } from 'solid-js'

import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useMediaQuery } from '../../../context/mediaQuery'
import { useSession } from '../../../context/session'
import { FollowingEntity, Topic } from '../../../graphql/schema/core.gen'
import { capitalize } from '../../../utils/capitalize'
import { getImageUrl } from '../../../utils/getImageUrl'
import { Button } from '../../_shared/Button'
import { CheckButton } from '../../_shared/CheckButton'
import styles from './TopicBadge.module.scss'
import { BadgeSubscribeButton } from "../../_shared/BadgeSubscribeButton";

type Props = {
  topic: Topic
  minimizeSubscribeButton?: boolean
  showStat?: boolean
}

export const TopicBadge = (props: Props) => {
  const { t, lang } = useLocalize()
  const { mediaMatches } = useMediaQuery()
  const [isMobileView, setIsMobileView] = createSignal(false)
  const { requireAuthentication } = useSession()
  const { setFollowing, loading: subLoading } = useFollowing()
  const [isSubscribed, setIsSubscribed] = createSignal<boolean>()
  const { follow, unfollow, subscriptions, subscribeInAction } = useFollowing()

  createEffect(() => {
    if(!subscriptions || !props.topic) return
    const subscribed = subscriptions.authors?.some((authorEntity) => authorEntity.id === props.topic?.id);
    setIsSubscribed(subscribed)
  })

  const handleFollowClick = () => {
    requireAuthentication(() => {
      follow(FollowingEntity.Topic, props.topic.slug)
    }, 'subscribe')
  }

  createEffect(() => {
    setIsMobileView(!mediaMatches.sm)
  })

  const title = () =>
    lang() === 'en' ? capitalize(props.topic.slug.replaceAll('-', ' ')) : props.topic.title

  return (
    <div class={styles.TopicBadge}>
      <div class={styles.content}>
        <div class={styles.basicInfo}>
          <a
            href={`/topic/${props.topic.slug}`}
            class={clsx(styles.picture, {
              [styles.withImage]: props.topic.pic,
              [styles.smallSize]: isMobileView(),
            })}
            style={
              props.topic.pic && {
                'background-image': `url('${getImageUrl(props.topic.pic, { width: 40, height: 40 })}')`,
              }
            }
          />
          <a href={`/topic/${props.topic.slug}`} class={styles.info}>
            <span class={styles.title}>{title()}</span>
            <Show
              when={props.topic.body}
              fallback={
                <div class={styles.description}>
                  {t('PublicationsWithCount', { count: props.topic?.stat?.shouts ?? 0 })}
                </div>
              }
            >
              <div class={clsx('text-truncate', styles.description)}>{props.topic.body}</div>
            </Show>
          </a>
        </div>
        <div class={styles.actions}>
          <BadgeSubscribeButton isSubscribed={isSubscribed()} action={handleFollowClick}/>
        </div>
      </div>
      <div class={styles.stats}>
        <span class={styles.statsItem}>{t('shoutsWithCount', { count: props.topic?.stat?.shouts })}</span>
        <span class={styles.statsItem}>{t('authorsWithCount', { count: props.topic?.stat?.authors })}</span>
        <span class={styles.statsItem}>
          {t('FollowersWithCount', { count: props.topic?.stat?.followers })}
        </span>
        <Show when={props.topic?.stat?.comments}>
          <span class={styles.statsItem}>
            {t('CommentsWithCount', { count: props.topic?.stat?.comments ?? 0 })}
          </span>
        </Show>
      </div>
    </div>
  )
}
