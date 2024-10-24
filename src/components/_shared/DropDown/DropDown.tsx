import type { PopupProps } from '../Popup'

import { clsx } from 'clsx'
import { For, Show, createMemo, createSignal, createEffect } from 'solid-js'

import { Popup } from '../Popup'

import popupStyles from '../Popup/Popup.module.scss'
import styles from './DropDown.module.scss'

export type Option = {
  value?: string | number
  title: string
}

export type OptionGroup = {
  title: string
  options: Option[]
  currentOption: Option
  onChange: (option: Option) => void
}

type Props = {
  class?: string
  popupProps?: Partial<PopupProps>
  options: OptionGroup[] | Option[]
  triggerCssClass?: string
  currentOption?: Option
  onChange?: (option: Option | OptionGroup) => void
}

const Chevron = (props: { class?: string }) => {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path d="M13.5 6L9 12L4.5 6H13.5Z" fill="#141414" />
    </svg>
  )
}

const CheckMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="check-mark"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const DropDown = (props: Props) => {
  const [isPopupVisible, setIsPopupVisible] = createSignal(false)

  const isOptionGroup = createMemo(() => Array.isArray(props.options) && props.options.length > 0 && 'options' in props.options[0])

  // Синхронизация currentOption с первой группой, 
  // если он передан и options являются OptionGroup[]
  createEffect(() => {
    if (props.currentOption && isOptionGroup()) {
      ;(props.options as OptionGroup[])[0].currentOption = props.currentOption
    }
  })

  return (
    <Show when={props.options.length > 0} keyed={true}>
      <Popup
        trigger={
          <div class={clsx(styles.trigger, props.triggerCssClass, styles.nonSelectable)}>
            {isOptionGroup() ? (props.options as OptionGroup[])[0].currentOption.title : (props.options as Option[])[0].title} {' '}
            <Chevron
              class={clsx(styles.chevron, {
                [styles.rotate]: isPopupVisible(),
              })}
            />
          </div>
        }
        variant="tiny"
        onVisibilityChange={(isVisible) => setIsPopupVisible(isVisible)}
        {...props.popupProps}
      >
        <ul class="nodash">
          <For each={props.options}>
            {(groupOrOption: OptionGroup | Option, groupIndex) => {
              if (isOptionGroup()) {
                const group = groupOrOption as OptionGroup
                return (
                  <div>
                    <Show when={isOptionGroup() && (props.options as OptionGroup[]).length > 1}>
                      {groupIndex() !== 0 && <li class={styles.separator}><hr /></li>}
                      <li class={styles.groupTitle}>{group.title}</li>
                    </Show>
                    <For each={group.options}>
                      {(option) => (
                        <li>
                          <button
                            class={clsx(popupStyles.action, {
                              [styles.active]: group.currentOption.value === option.value,
                            })}
                            onClick={() => group.onChange(option)}
                          >
                            <span>{option.title}</span>
                            <Show when={group.currentOption.value === option.value}>
                              <CheckMark />
                            </Show>
                          </button>
                        </li>
                      )}
                    </For>
                  </div>
                )
              } else {
                const option = groupOrOption as Option
                return (
                  <li>
                    <button
                      class={clsx(popupStyles.action, {
                        [styles.active]: props.currentOption?.value === option.value,
                      })}
                      onClick={() => props.onChange && props.onChange(option)}
                    >
                      <span>{option.title}</span>
                      <Show when={props.currentOption?.value === option.value}>
                        <CheckMark />
                      </Show>
                    </button>
                  </li>
                )
              }
            }}
          </For>
        </ul>
      </Popup>
    </Show>
  )
}
