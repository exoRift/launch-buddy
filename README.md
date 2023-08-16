# LaunchBuddy
LaunchBuddy is a tool to assist with syncing deployments, helping you discretely launch features in unison

LaunchBuddy was built for [Render](https://render.com) projects that deploy from [Github](https://github.com) branches

To get started, build the project with `pnpm build`. If you already have the executable, use `./lb init` to initialize your config.

After your config is set up, use `./lb deploy` to start deploying.

## To get a Github token
- Go to [Your tokens settings](https://github.com/settings/tokens)
- Create a token with the `repo` permission

## To get a Render token
- Go to [Render](https://render.com)
- Go to your settings (make sure you're scoped under your user and not your org)
- Go to `API Keys`
- Create an API key

## To get your Clerk secret
- Go to your [Clerk Dashboard](https://dashboard.clerk.com)
- Go to your app
- Go to `API Keys`
- Copy the `secret key`

## To get your render service IDs
- Go to [Render](https://render.com)
- Go to your service
- Copy the service ID from the URL (It's prefixed with `srv_`)