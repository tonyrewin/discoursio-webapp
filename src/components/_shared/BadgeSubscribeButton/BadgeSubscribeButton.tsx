import { clsx } from 'clsx'
import styles from './BadgeDubscribeButton.module.scss'
import { CheckButton } from "../CheckButton";
import { Show } from "solid-js";
import { Button } from "../Button";
import { Icon } from "../Icon";
import stylesButton from "../Button/Button.module.scss";
import { useLocalize } from "../../../context/localize";

type Props = {
  class?: string
  isSubscribed: boolean
  minimizeSubscribeButton?: boolean
  action: () => void
  iconButtons?: boolean
}

export const BadgeSubscribeButton = (props: Props) => {
  const { t } = useLocalize()

  return (
    <div class={props.class}>
      <Show
        when={!props.minimizeSubscribeButton}
        fallback={<CheckButton text={t('Follow')} checked={props.isSubscribed} onClick={props.action} />}
      >
        <Show
          when={props.isSubscribed}
          fallback={
            <Button
              variant={props.iconButtons ? 'secondary' : 'bordered'}
              size="S"
              value={
                <Show when={props.iconButtons} fallback={t('Subscribe')}>
                  <Icon name="author-subscribe" class={stylesButton.icon} />
                </Show>
              }
              onClick={props.action}
              isSubscribeButton={true}
              class={clsx(styles.actionButton, {
                [styles.iconed]: props.iconButtons,
                [stylesButton.subscribed]: props.isSubscribed,
              })}
            />
          }
        >
          <Button
            variant={props.iconButtons ? 'secondary' : 'bordered'}
            size="S"
            value={
              <Show
                when={props.iconButtons}
                fallback={
                  <>
                    <span class={styles.actionButtonLabel}>{t('Following')}</span>
                    <span class={styles.actionButtonLabelHovered}>{t('Unfollow')}</span>
                  </>
                }
              >
                <Icon name="author-unsubscribe" class={stylesButton.icon} />
              </Show>
            }
            onClick={props.action}
            isSubscribeButton={true}
            class={clsx(styles.actionButton, {
              [styles.iconed]: props.iconButtons,
              [stylesButton.subscribed]: props.isSubscribed,
            })}
          />
        </Show>
      </Show>
    </div>
  )
}
