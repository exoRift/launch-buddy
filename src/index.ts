#!/usr/bin/env -S node --no-warnings

import { Command } from 'commander'
import pkg from '../package.json' assert { type: 'json' }

import * as init from './commands/init.js'
import * as status from './commands/status.js'
import * as deploy from './commands/deploy.js'
import * as users from './commands/users.js'

const program = new Command()

program
  .name('LaunchBuddy')
  .description(pkg.description)
  .version(pkg.version)
  .addHelpText('before', `Written by ${pkg.author} - ${pkg.repository.url.replace('.git', '')}`)

init.mount(program)
status.mount(program)
deploy.mount(program)
users.mount(program)

await program.parseAsync()
