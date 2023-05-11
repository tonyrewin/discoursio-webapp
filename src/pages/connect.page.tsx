import { PageLayout } from '../components/_shared/PageLayout'

export const ConnectPage = () => {
  return (
    <PageLayout>
      <article class="wide-container container--static-page">
        <div class="row">
          <div class="col-sm-20 col-md-16 col-lg-14 col-xl-12 offset-md-5">
            <h1>
              <span class="wrapped">Предложить идею</span>
            </h1>

            <p>
              Хотите что-то предложить, обсудить или посоветовать? Поделиться темой или идеей? Напишите нам
              скорее! Если укажете свою почту, мы&nbsp;обязательно ответим.
            </p>

            <form action="/api/feedback">
              <div class="pretty-form__item">
                <select id="subject">
                  <option value="">Сотрудничество</option>
                  <option value="">Посоветовать тему</option>
                  <option value="">Сообщить об ошибке</option>
                  <option value="">Предложить проект</option>
                  <option value="">Волонтерство</option>
                  <option value="">Другое</option>
                </select>
              </div>
              <div class="pretty-form__item">
                <input type="text" id="contact-email" placeholder="Email для обратной связи" />
                <label for="contact-email">Email для обратной связи</label>
              </div>
              <div class="pretty-form__item">
                <textarea id="message" placeholder="Текст сообщения" />
                <label for="message">Текст сообщения</label>
              </div>
              <button class="button">Отправить письмо</button>
            </form>
          </div>
        </div>
      </article>
    </PageLayout>
  )
}

export const Page = ConnectPage
