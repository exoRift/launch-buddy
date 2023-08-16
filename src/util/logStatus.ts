import chalk from 'chalk'
import { type Fetcher } from './axios'

import type template from '../templates/config.json'

export async function logStatus (config: typeof template, fetcher: Fetcher): Promise<void> {
  await Promise.all(config.services.map(async (s) => {
    const servicePromise = fetcher.render.get(`/services/${s.serviceID}`)
      .then(({ data }) => data)

    const deploymentPromise = fetcher.render.get(`/services/${s.serviceID}/deploys`, {
      params: {
        limit: 1
      }
    })
      .then(({ data: [{ deploy }] }) => deploy)

    const service = await servicePromise
    const deployment = await deploymentPromise

    const repo: string = service.repo.split('/').slice(-2).join('/')
    const commits = await fetcher.github.get(`/repos/${repo}/commits`, {
      params: {
        since: deployment.commit.createdAt,
        sha: service.branch
      }
    })
      .then(({ data }) => data.slice(0, data.length - 1))

    const statusColor = deployment.status === 'live'
      ? chalk.greenBright
      : chalk.redBright

    console.log(
      `${chalk.blueBright(service.name)} (${statusColor(deployment.status)}) - ${chalk.redBright(commits.length)} commits since the last deployment`
    )

    for (const commit of commits) {
      console.log('\t', chalk.gray(commit.commit.message.split('\n')[0]))
    }
  }))
}
