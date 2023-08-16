import { type Fetcher } from './axios'
import chalk from 'chalk'

interface Session {
  user_id: string
  last_active_at: number
}

interface User {
  first_name: string
  last_name: string
}

const timeFormat = new Intl.RelativeTimeFormat(undefined, {
  style: 'long'
})

export async function logActiveUsers (fetcher: Fetcher): Promise<void> {
  return await fetcher.clerk.get('/sessions', {
    params: {
      status: 'active'
    }
  })
    .then(async ({ data }: { data: Session[] }) => {
      for (const session of data) {
        const user: User = (await fetcher.clerk.get(`/users/${session.user_id}`)).data

        const timeElapsed = timeFormat.format((session.last_active_at - Date.now()) / 60000, 'minutes')

        console.log(`${chalk.blueBright(`${user.first_name} ${user.last_name}`)} - Last active ${chalk.magentaBright(timeElapsed)}`)
      }
    })
}
