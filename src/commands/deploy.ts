import { type Command } from 'commander'
import path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'

import type template from '../templates/config.json'
import { buildFetcher } from '../util/axios.js'

interface Arguments {
  c: string
}

async function deployAction ({ c: configPath }: Arguments): Promise<void> {
  const config: typeof template = (await import(path.resolve(process.cwd(), configPath), { assert: { type: 'json' } })).default

  const fetcher = buildFetcher(config.ghToken, config.renderToken)

  const updates = await Promise.all(config.services.map(async (s) => {
    const service = fetcher.render.get(`/services/${s.serviceID}`)
      .then(({ data }) => data)

    const lastDeploy = fetcher.render.get(`/services/${s.serviceID}/deploys`, {
      params: {
        limit: 1
      }
    })
      .then(({ data }) => data)

    const repo: string = (await service).repo.split('/').slice(-2).join('/')

    const commits = fetcher.github.get(`/repos/${repo}/commits`, {
      params: {
        since: (await lastDeploy).createdAt
      }
    })
      .then(({ data }) => data)

    return [s, await commits]
  }))

  for (const [name, update] of updates) {
    console.log(`${chalk.blueBright(name)} - ${chalk.redBright(update.length)} commits since the last deployment`)

    for (const commit of update) {
      console.log('\t', chalk.gray(commit.commit.message.split('\n')[0]))
    }
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
    .then((answers: (typeof config)['services']) => {
      for (const answer of answers) {
        void fetcher.render.post(`/services/${answer.serviceID}/deploys`)
          .then(() => console.log(chalk.greenBright(`${answer.name} deployment triggered!`)))
      }
    })
}

export function mountDeploy (program: Command): void {
  program
    .command('deploy')
    .description('Deploy your services')
    .option('-c <path>', 'The path to your config.json', 'config.json')
    .action(deployAction)
}
