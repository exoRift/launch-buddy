import chalk from 'chalk'
import { type Fetcher } from './axios'

import type template from '../templates/config.json'

export interface Service {
  id: string
  name: string
  repo: string
  branch: string
}

export interface Deployment {
  commit: {
    createdAt: number
  }
  status: string
}

export interface Commit {
  commit: {
    message: string
  }
}

export type ServiceStatus = [service: Service, deployment: Deployment, commits: Commit[]]

export function logStatus (config: typeof template, fetcher: Fetcher): Promise<ServiceStatus[]> {
  return Promise.all(config.services.map(async (s) => {
    const servicePromise: Promise<Service> = fetcher.render.get(`/services/${s}`)
      .then(({ data }) => data)

    const deploymentPromise: Promise<Deployment> = fetcher.render.get(`/services/${s}/deploys`, {
      params: {
        limit: 1
      }
    })
      .then(({ data: [{ deploy }] }) => deploy)

    const service = await servicePromise
    const deployment = await deploymentPromise

    const repo = service.repo.split('/').slice(-2).join('/')
    const commits: Commit[] = await fetcher.github.get(`/repos/${repo}/commits`, {
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

    return [service, deployment, commits]
  }))
}
