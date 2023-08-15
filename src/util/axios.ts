import axios, { type AxiosInstance } from 'axios'

const GITHUB_API_URL = 'https://api.github.com'
const RENDER_API_URL = 'https://api.render.com/v1'

export interface Fetcher {
  github: AxiosInstance
  render: AxiosInstance
}

export function buildFetcher (ghToken: string, renderToken: string): Fetcher {
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
    })
  }
}
