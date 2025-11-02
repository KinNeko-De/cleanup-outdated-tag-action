import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * Resolve the token to use for GitHub API calls.
 * Prefer the `token` action input; fall back to the `GITHUB_TOKEN` env var.
 * Returns the token and a flag indicating whether it came from the input.
 */
function resolveToken(): string | undefined {
  const inputToken = core.getInput('token')
  const token =
    inputToken && inputToken.length > 0 ? inputToken : process.env.GITHUB_TOKEN

  core.debug(
    inputToken
      ? 'Using token from action input'
      : 'Using token from GITHUB_TOKEN env'
  )

  return token
}

export async function run(): Promise<void> {
  try {
    const token = resolveToken()

    if (!token) {
      core.setFailed(
        'No GitHub token provided via input or GITHUB_TOKEN env var'
      )
      return
    }

    const octokit = github.getOctokit(token)

    const existingFeatureBranches: string[] = (
      await octokit.rest.repos.listBranches({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
      })
    ).data.map(branch => branch.name)

    core.debug(`Existing feature branches: ${existingFeatureBranches}`)

    const tags = await octokit.rest.git.listMatchingRefs({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: 'tags/v'
    })

    for (const tag of tags.data) {
      const tagName: string = tag.ref.replace('refs/tags/', '')
      core.debug(`Tag: ${tagName}`)

      const tagParts: RegExpExecArray | null =
        /^v[0-9]*\.[0-9]*\.[0-9]*-(.*)\.([0-9]*)$/.exec(tagName)
      if (tagParts) {
        const featureBranchName: string = tagParts[1]
        core.debug(`Feature branch name: ${featureBranchName}`)

        if (!existingFeatureBranches.includes(`feature/${featureBranchName}`)) {
          core.info(
            `Branch ${featureBranchName} does not exist, so deleting tag ${tagName}`
          )
          await octokit.rest.git.deleteRef({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            ref: `tags/${tagName}`
          })
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unknown error occurred')
    }
  }
}
