import { type Command } from 'commander'
import fs from 'fs/promises'
import path from 'path'

import template from '../templates/config.json' assert { type: 'json' }

async function initAction (): Promise<void> {
  return await fs.writeFile(path.resolve(process.cwd(), 'config.json'), JSON.stringify(template, null, 2))
}

export function mountInit (program: Command): void {
  program
    .command('init')
    .description('Initialize the config.json')
    .action(initAction)
}
