import type { JSX } from 'solid-js/jsx-runtime'
import { For, Show } from 'solid-js/web'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'
import './Group.scss'

interface GroupProps {
  articles: Shout[]
  header?: JSX.Element
}

export default (props: GroupProps) => {
  if (!props.articles) props.articles = []
  return (
    <div class="floor floor--important">
      <Show when={props.articles.length > 4}>
        <div class="wide-container row">
          <div class="group__header col-12">{props.header}</div>

          <div class="col-lg-6">
            <ArticleCard article={props.articles[0]} settings={{ nosubtitle: false, noicon: true }} />
          </div>

          <div class="col-lg-6">
            <div class="row">
              <Show when={props.articles.length < 4}>
                <For each={props.articles.slice(1, props.articles.length)}>
                  {(a) => (
                    <div class="row">
                      <div class="col-md-8">
                        <ArticleCard article={a} settings={{ nosubtitle: false, noicon: true }} />
                      </div>
                    </div>
                  )}
                </For>
              </Show>
              <Show when={props.articles.length >= 4}>
                <div class="col-md-6">
                  <For each={props.articles.slice(1, 3)}>
                    {(a) => <ArticleCard article={a} settings={{ noicon: true, noimage: true }} />}
                  </For>
                </div>
                <div class="col-md-6">
                  <For each={props.articles.slice(3, 5)}>
                    {(a) => <ArticleCard article={a} settings={{ noicon: true, noimage: true }} />}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}
