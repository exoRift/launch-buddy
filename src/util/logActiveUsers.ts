import chalk from 'chalk'
import { type Fetcher } from './axios.js'

export interface Session {
  user_id: string
  last_active_at: number
}

export interface User {
  first_name: string
  last_name: string
}

export type ActiveUser = [user: User, session: Session]

const timeFormat = new Intl.RelativeTimeFormat(undefined, {
  style: 'long'
})

export async function logActiveUsers (fetcher: Fetcher): Promise<ActiveUser[]> {
  return await Promise.all(await fetcher.clerk.get('/sessions', {
    params: {
      status: 'active',
      limit: 20
    }
  })
    .then(({ data }: { data: Session[] }) => data)
    .then((sessions) =>
      sessions.map((session) =>
        fetcher.clerk.get(`/users/${session.user_id}`)
          .then(({ data: user }: { data: User }) => {
            const timeElapsed = timeFormat.format((session.last_active_at - Date.now()) / 60000, 'minutes')

            console.log(`${chalk.blueBright(`${user.first_name} ${user.last_name}`)} - Last active ${chalk.magentaBright(timeElapsed)}`)

            return [user, session] satisfies ActiveUser
          })
      )
    ))
}
