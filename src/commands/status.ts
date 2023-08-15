import { type Command } from 'commander'
import path from 'path'

import type template from '../templates/config.json'

import { buildFetcher } from '../util/axios'
import { logStatus } from '../util/logStatus'

interface Arguments {
  c: string
}

async function statusAction ({ c: configPath }: Arguments): Promise<void> {
  const config: typeof template = (await import(path.resolve(process.cwd(), configPath), { assert: { type: 'json' } })).default

  const fetcher = buildFetcher(config.ghToken, config.renderToken)

  return await logStatus(config, fetcher)
}

export function mountStatus (program: Command): void {
  program
    .command('status')
    .description('View the status of your services')
    .option('-c <path>', 'The path to your config.json', 'config.json')
    .action(statusAction)
}
