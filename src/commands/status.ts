import { type Command } from 'commander'
import path from 'path'
import chalk from 'chalk'

import type template from '../templates/config.json'

import { buildFetcher } from '../util/axios'
import { logStatus } from '../util/logStatus'

interface Arguments {
  c: string
}

async function statusAction ({ c: configPath }: Arguments): Promise<void> {
  const config: typeof template = (await import(path.resolve(process.cwd(), configPath), { assert: { type: 'json' } })).default

  const fetcher = buildFetcher(config)

  return await logStatus(config, fetcher)
    .catch((err) => {
      console.error(chalk.redBright('Something went wrong! (incorrect/missing Render/Github token?)'))

      throw err
    })
}

export function mountStatus (program: Command): void {
  program
    .command('status')
    .description('View the status of your services')
    .option('-c <path>', 'The path to your lbconfig.json', 'lbconfig.json')
    .action(statusAction)
}
