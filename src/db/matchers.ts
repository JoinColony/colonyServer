import Linkify from 'linkify-it'

const USER_PREFIX = '@'
const ENS_DOMAIN_REGEX = '^([A-Za-z0-9](?:[A-Za-z0-9-.]{0,255}[A-Za-z0-9])?)'

const USERNAME_SCHEMA = {
  prefix: USER_PREFIX,
  name: 'username',
  schema: {
    validate(text: string, pos: any, self: any) {
      const tail = text.slice(pos)
      const usernameRegex =
        self.re.username ||
        new RegExp(`${ENS_DOMAIN_REGEX}(?=$|${self.re.src_ZPCc})`)
      if (usernameRegex.test(tail)) {
        // We additionally disable `@` ("@@mention" is invalid)
        if (tail[0] === USER_PREFIX) {
          return false
        }
        return (tail.match(usernameRegex) || [])[0].length
      }
      return 0
    },
  },
}

const matcher = new Linkify()

matcher // Remove default matchers, as we don't care about those here
  .add('http:', null)
  .add('https:', null)
  .add('//', null)
  .add('mailto:', null)
  .add(USERNAME_SCHEMA.prefix, USERNAME_SCHEMA.schema)

export const matchUsernames = (text: string): string[] => {
  const matches = matcher.match(text)
  return matches ? matches.map((match) => match.text.substr(1)) : []
}
