import { Command } from 'commander'
import pkg from '../package.json'

import { mountInit } from './commands/init'
import { mountStatus } from './commands/status'
import { mountDeploy } from './commands/deploy'

const program = new Command()

program
  .name('LaunchBuddy')
  .description(pkg.description)
  .version(pkg.version)
  .addHelpText('before', `Written by ${pkg.author} - ${pkg.repository.url}`)

mountInit(program)
mountStatus(program)
mountDeploy(program)

program.parse()
