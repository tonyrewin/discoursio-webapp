import { gql } from '@urql/core'

export default gql`
  mutation UpdateShoutMutation($slug: String!, $shout: ShoutInput!) {
    updateShout(slug: $slug, inp: $shout) {
      error
      shout {
        id
        slug
        title
        subtitle
        body
      }
    }
  }
`
