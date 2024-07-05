import { AuthGuard } from '~/components/AuthGuard'
import { ProfileSubscriptions } from '~/components/Views/ProfileSubscriptions'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'

export const ProfileSubscriptionsPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout withPadding={true} title={`${t('Discours')} :: ${t('Subscriptions')}`}>
      <AuthGuard>
        <ProfileSubscriptions />
      </AuthGuard>
    </PageLayout>
  )
}

export default ProfileSubscriptionsPage
