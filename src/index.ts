import { Command } from 'commander'
import pkg from '../package.json' assert { type: 'json' }

import * as init from './commands/init'
import * as status from './commands/status'
import * as deploy from './commands/deploy'
import * as users from './commands/users'

const program = new Command()

program
  .name('LaunchBuddy')
  .description(pkg.description)
  .version(pkg.version)
  .addHelpText('before', `Written by ${pkg.author} - ${pkg.repository.url}`)

init.mount(program)
status.mount(program)
deploy.mount(program)
users.mount(program)

await program.parseAsync()
