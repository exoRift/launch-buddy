import { type Command } from 'commander'
import path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'

import type template from '../templates/config.json'

import { buildFetcher } from '../util/axios'
import { logStatus } from '../util/logStatus'
import { logActiveUsers } from '../util/logActiveUsers'

interface Arguments {
  c: string
}

async function deployAction ({ c: configPath }: Arguments): Promise<void> {
  const config: typeof template = (await import(path.resolve(process.cwd(), configPath), { assert: { type: 'json' } })).default

  const fetcher = buildFetcher(config)

  await logStatus(config, fetcher)
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
    choices: config.services.map((s) => ({
      name: s.name,
      value: s
    }))
  }])
    .then(({ deploy: answers }: { deploy: (typeof config)['services'] }) =>
      inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `You will update: ${chalk.yellowBright(answers.map((s) => s.name).join(', '))}. Are you sure?`,
        default: false
      })
        .then(({ confirm }) => {
          if (confirm) {
            for (const answer of answers) {
              void fetcher.render.post(`/services/${answer.serviceID}/deploys`)
                .then(() => console.log(chalk.greenBright(`${answer.name} deployment triggered!`)))
            }
          } else console.log(chalk.redBright('Deployment aborted.'))
        })
    )
}

export function mountDeploy (program: Command): void {
  program
    .command('deploy')
    .description('Deploy your services')
    .option('-c <path>', 'The path to your config.json', 'config.json')
    .action(deployAction)
}
