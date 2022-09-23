import { t } from '../../utils/intl'
import { Icon } from '../Nav/Icon'
import styles from '../../styles/FourOuFour.module.scss'
import clsx from 'clsx'

export const FourOuFourView = (_props) => {
  return (
    <div class={styles.errorPageWrapper}>
      <div class={styles.errorPage}>
        <div class="container">
          <div class="row">
            <div class="col-md-7 offset-md-3">
              <a href="/" class="image-link">
                <img class={styles.errorImage} src="/error.svg" alt="error" width="auto" height="auto" />
              </a>
            </div>
          </div>
          <div class="row">
            <div class={clsx(styles.errorTextContainer, 'col-md-2 col-sm-3 offset-sm-1 offset-md-2')}>
              <div class={styles.errorText}>
                <div>{t('Error')}</div>
                <div class={styles.big}>404</div>
              </div>
            </div>
            <div class={clsx(styles.searchFormContainer, 'col-sm-5 col-md-4')}>
              <div class={styles.errorExplain}>
                <p>{t(`You've reached a non-existed page`)}</p>
                <p>{t('Try to find another way')}:</p>
                <form class={clsx(styles.prettyForm, 'pretty-form')} action="/search" method="get">
                  <div class={clsx(styles.prettyFormItem, 'pretty-form__item')}>
                    <input type="text" name="q" placeholder={t('Search')} id="search-field" />
                    <label for="search-field">{t('Search')}</label>
                    <button type="submit" class={styles.searchSubmit}>
                      <Icon name="search" />
                    </button>
                  </div>
                </form>
                <p class={styles.textCenter}>
                  <a href="/">{t('Back to mainpage')}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
