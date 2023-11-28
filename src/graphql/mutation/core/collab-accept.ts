import { gql } from '@urql/core'

export default gql`
  mutation CollabInviteMutation($invite_id: Int!) {
    accept_invite(invite_id: $invite_id) {
      error
    }
  }
`
