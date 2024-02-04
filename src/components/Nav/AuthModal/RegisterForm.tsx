import type { JSX } from 'solid-js'
import type { AuthModalSearchParams } from './types'

import { clsx } from 'clsx'
import { Show, createSignal } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { checkEmail, useEmailChecks } from '../../../stores/emailChecks'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'
import { validateEmail } from '../../../utils/validateEmail'

import { AuthModalHeader } from './AuthModalHeader'
import { PasswordField } from './PasswordField'
import { SocialProviders } from './SocialProviders'
import { email, setEmail } from './sharedLogic'

import styles from './AuthModal.module.scss'

type FormFields = {
  fullName: string
  email: string
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string | JSX.Element>>

const handleEmailInput = (newEmail: string) => {
  setEmail(newEmail.toLowerCase())
}

export const RegisterForm = () => {
  const { changeSearchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()
  const { emailChecks } = useEmailChecks()
  const {
    actions: { signUp },
  } = useSession()
  const [submitError, setSubmitError] = createSignal('')
  const [fullName, setFullName] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [isSuccess, setIsSuccess] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})
  const [passwordError, setPasswordError] = createSignal<string>()

  const authFormRef: { current: HTMLFormElement } = { current: null }

  const handleEmailBlur = () => {
    if (validateEmail(email())) {
      checkEmail(email())
    }
  }

  const handleNameInput = (newName: string) => {
    setFullName(newName)
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()

    if (passwordError()) {
      setValidationErrors((errors) => ({ ...errors, password: passwordError() }))
    } else {
      setValidationErrors(({ password: _notNeeded, ...rest }) => rest)
    }
    setValidationErrors(({ email: _notNeeded, ...rest }) => rest)
    setValidationErrors(({ fullName: _notNeeded, ...rest }) => rest)

    setSubmitError('')

    const newValidationErrors: ValidationErrors = {}

    const cleanName = fullName().trim()
    const cleanEmail = email().trim()

    if (!cleanName) {
      newValidationErrors.fullName = t('Please enter a name to sign your comments and publication')
    }

    if (!cleanEmail) {
      newValidationErrors.email = t('Please enter email')
    } else if (!validateEmail(email())) {
      newValidationErrors.email = t('Invalid email')
    }

    if (!password()) {
      newValidationErrors.password = t('Please enter password')
    }

    setValidationErrors(newValidationErrors)

    const emailCheckResult = await checkEmail(cleanEmail)

    const isValid = Object.keys(newValidationErrors).length === 0 && !emailCheckResult

    if (!isValid) {
      authFormRef.current
        .querySelector<HTMLInputElement>(`input[name="${Object.keys(newValidationErrors)[0]}"]`)
        .focus()

      return
    }

    setIsSubmitting(true)
    try {
      const opts = {
        given_name: cleanName,
        email: cleanEmail,
        password: password(),
        confirm_password: password(),
        redirect_uri: window.location.origin,
      }
      const { errors } = await signUp(opts)
      if (errors?.some((error) => error.message.includes('has already signed up'))) {
        setValidationErrors((prev) => ({
          ...prev,
          email: (
            <>
              {t('User with this email already exists')},{' '}
              <span
                class={'link'}
                onClick={() =>
                  changeSearchParams({
                    mode: 'login',
                  })
                }
              >
                {t('sign in')}
              </span>
            </>
          ),
        }))
      }
      setIsSuccess(true)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Show when={!isSuccess()}>
        <form onSubmit={handleSubmit} class={styles.authForm} ref={(el) => (authFormRef.current = el)}>
          <div>
            <AuthModalHeader modalType="register" />
            <Show when={submitError()}>
              <div class={styles.authInfo}>
                <div class={styles.warn}>{submitError()}</div>
              </div>
            </Show>
            <div
              class={clsx('pretty-form__item', {
                'pretty-form__item--error': validationErrors().fullName,
              })}
            >
              <input
                name="fullName"
                type="text"
                placeholder={t('Full name')}
                autocomplete=""
                onInput={(event) => handleNameInput(event.currentTarget.value)}
              />
              <label for="name">{t('Full name')}</label>
              <Show when={validationErrors().fullName}>
                <div class={styles.validationError}>{validationErrors().fullName}</div>
              </Show>
            </div>

            <div
              class={clsx('pretty-form__item', {
                'pretty-form__item--error': validationErrors().email,
              })}
            >
              <input
                id="email"
                name="email"
                autocomplete="email"
                type="email"
                value={email()}
                placeholder={t('Email')}
                onInput={(event) => handleEmailInput(event.currentTarget.value)}
                onBlur={handleEmailBlur}
              />
              <label for="email">{t('Email')}</label>
              <Show when={validationErrors().email}>
                <div class={styles.validationError}>{validationErrors().email}</div>
              </Show>
              <Show when={emailChecks()[email()]}>
                <div class={styles.validationError}>
                  {t("This email is already taken. If it's you")},{' '}
                  <span class="link" onClick={() => changeSearchParams({ mode: 'login' })}>
                    {t('enter')}
                  </span>
                </div>
              </Show>
            </div>

            <PasswordField
              errorMessage={(err) => setPasswordError(err)}
              onInput={(value) => setPassword(value)}
            />

            <div>
              <button class={clsx('button', styles.submitButton)} disabled={isSubmitting()} type="submit">
                {isSubmitting() ? '...' : t('Join')}
              </button>
            </div>
          </div>

          <div>
            <SocialProviders />

            <div class={styles.authControl}>
              <span
                class={styles.authLink}
                onClick={() =>
                  changeSearchParams({
                    mode: 'login',
                  })
                }
              >
                {t('I have an account')}
              </span>
            </div>
          </div>
        </form>
      </Show>
      <Show when={isSuccess()}>
        <div class={styles.title}>{t('Almost done! Check your email.')}</div>
        <div class={styles.text}>{t("We've sent you a message with a link to enter our website.")}</div>
        <div>
          <button class={clsx('button', styles.submitButton)} onClick={() => hideModal()}>
            {t('Back to main page')}
          </button>
        </div>
      </Show>
    </>
  )
}
