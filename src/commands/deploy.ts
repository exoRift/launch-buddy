import { type Command } from 'commander'
import path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'

import type template from '../templates/config.json'

import { buildFetcher } from '../util/axios.js'
import { type Service, logStatus } from '../util/logStatus.js'
import { logActiveUsers } from '../util/logActiveUsers.js'

interface Arguments {
  c: string
}

async function action ({ c: configPath }: Arguments): Promise<void> {
  const config: typeof template = (await import(path.resolve(process.cwd(), configPath), { assert: { type: 'json' } })).default

  const fetcher = buildFetcher(config)

  const statuses = await logStatus(config, fetcher)
    .catch((err) => {
      console.error(chalk.redBright('Something went wrong! (Incorrect/missing Render/Github token?)'))

      throw err
    })

  try {
    console.info(chalk.bold('\nActive users:'))

    await logActiveUsers(fetcher)
  } catch {
    console.warn(chalk.gray('Could not fetch active users (missing/incorrect Clerk secret in config?)'))
  }

  await inquirer.prompt([{
    type: 'checkbox',
    name: 'deploy',
    message: 'Which services would you like to deploy?',
    choices: statuses.map(([s]) => ({
      name: s.name,
      value: s
    }))
  }])
    .then(({ deploy: answers }: { deploy: Service[] }) =>
      inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `You will update: ${chalk.yellowBright(answers.map((s) => s.name).join(', '))}. Are you sure?`,
        default: false
      })
        .then(({ confirm }) => {
          if (confirm) {
            for (const answer of answers) {
              void fetcher.render.post(`/services/${answer.id}/deploys`)
                .then(() => console.log(chalk.greenBright(`${answer.name} deployment triggered!`)))
            }
          } else console.log(chalk.redBright('Deployment aborted.'))
        })
    )
}

export function mount (program: Command): void {
  program
    .command('deploy')
    .description('Deploy your services')
    .option('-c <path>', 'The path to your lbconfig.json', 'lbconfig.json')
    .action(action)
}
