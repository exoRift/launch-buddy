import chalk from 'chalk'
import { type Fetcher } from './axios'

import type template from '../templates/config.json'

export async function logStatus (config: typeof template, fetcher: Fetcher): Promise<void> {
  const updates = await Promise.all(config.services.map(async (s) => {
    const service = fetcher.render.get(`/services/${s.serviceID}`)
      .then(({ data }) => data)

    const lastDeploy = fetcher.render.get(`/services/${s.serviceID}/deploys`, {
      params: {
        limit: 1
      }
    })
      .then(({ data: [{ deploy }] }) => deploy)

    const repo: string = (await service).repo.split('/').slice(-2).join('/')

    const commits = fetcher.github.get(`/repos/${repo}/commits`, {
      params: {
        since: (await lastDeploy).commit.createdAt,
        sha: (await service).branch
      }
    })
      .then(({ data }) => data.slice(0, data.length - 1))

    return [s, await lastDeploy, await commits]
  }))

  for (const [service, deploy, commits] of updates) {
    const statusColor = deploy.status === 'live'
      ? chalk.greenBright
      : chalk.redBright

    console.log(`${chalk.blueBright(service.name)} (${statusColor(deploy.status)}) - ${chalk.redBright(commits.length)} commits since the last deployment`)

    for (const commit of commits) {
      console.log('\t', chalk.gray(commit.commit.message.split('\n')[0]))
    }
  }
}
