import axios, { type AxiosInstance } from 'axios'

const GITHUB_API_URL = 'https://api.github.com'
const RENDER_API_URL = 'https://api.render.com/v1'
const CLERK_API_URL = 'https://api.clerk.com/v1'

export interface Fetcher {
  github: AxiosInstance
  render: AxiosInstance
  clerk: AxiosInstance
}

export interface FetcherConfig {
  ghToken: string
  renderToken: string
  clerkSecret: string
}

export function buildFetcher (config: FetcherConfig): Fetcher {
  const {
    ghToken,
    renderToken,
    clerkSecret
  } = config

  return {
    github: axios.create({
      baseURL: GITHUB_API_URL,
      headers: {
        Authorization: 'Bearer ' + ghToken
      }
    }),
    render: axios.create({
      baseURL: RENDER_API_URL,
      headers: {
        Authorization: 'Bearer ' + renderToken
      }
    }),
    clerk: axios.create({
      baseURL: CLERK_API_URL,
      headers: {
        Authorization: 'Bearer ' + clerkSecret
      }
    })
  }
}
