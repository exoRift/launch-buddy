import { type Command } from 'commander'
import path from 'path'
import chalk from 'chalk'

import type template from '../templates/config.json'

import { buildFetcher } from '../util/axios'
import { logActiveUsers } from '../util/logActiveUsers'

interface Arguments {
  c: string
}

async function userAction ({ c: configPath }: Arguments): Promise<void> {
  const config: typeof template = (await import(path.resolve(process.cwd(), configPath), { assert: { type: 'json' } })).default

  const fetcher = buildFetcher(config)

  return await logActiveUsers(fetcher)
    .catch((err) => {
      console.error(chalk.redBright('Something went wrong! (incorrect/missing Clerk secret?)'))

      throw err
    })
}

export function mountUsers (program: Command): void {
  program
    .command('users')
    .description('See a list of users currently using your application (Requires a Clerk secret to be provided in the config)')
    .option('-c <path>', 'The path to your lbconfig.json', 'lbconfig.json')
    .action(userAction)
}
