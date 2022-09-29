import clsx from 'clsx'
import { mergeProps, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import './Icon.css'

type IconProps = {
  className?: string
  iconClassName?: string
  style?: string | JSX.CSSProperties
  title?: string
  name?: string
  counter?: number
}

export const Icon = (passedProps: IconProps) => {
  const props = mergeProps({ title: '', counter: 0 }, passedProps)

  return (
    <div class={clsx('icon', props.className)} style={props.style}>
      <img src={`/icons/${props.name}.svg`} alt={props.title ?? props.name} class={props.iconClassName} />
      <Show when={props.counter}>
        <div class="notifications-counter">{props.counter}</div>
      </Show>
    </div>
  )
}
