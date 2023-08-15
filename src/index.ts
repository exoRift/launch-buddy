import { Command } from 'commander'
import pkg from '../package.json' assert { type: 'json' }

import { mountInit } from './commands/init.js'
import { mountStatus } from './commands/status.js'
import { mountDeploy } from './commands/deploy.js'

const program = new Command()

program
  .name('LaunchBuddy')
  .description(pkg.description)
  .version(pkg.version)

mountInit(program)
mountStatus(program)
mountDeploy(program)

program.parse()
