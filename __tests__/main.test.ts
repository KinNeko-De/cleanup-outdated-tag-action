import { vi, describe, it, expect, beforeEach, type MockInstance } from 'vitest'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as main from '../src/main'

// Mock the GitHub Actions core library
// let debugMock: MockInstance<typeof core.debug>
// let errorMock: MockInstance<typeof core.error>
// let getInputMock: MockInstance<typeof core.getInput>
let setFailedMock: MockInstance
// let setOutputMock: MockInstance<typeof core.setOutput>
const repoOwner = 'mockOwner'
const repoName = 'mockRepo'

vi.mock('@actions/core')
vi.mock('@actions/github')

// Mock the action's main function
const runMock = vi.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // debugMock = vi.spyOn(core, 'debug').mockImplementation()
    // errorMock = vi.spyOn(core, 'error').mockImplementation()
    vi.spyOn(core, 'getInput').mockImplementation(name => {
      if (name === 'token') {
        return 'ghp_mockGithubToken123'
      }
      return ''
    })
    setFailedMock = vi.spyOn(core, 'setFailed').mockImplementation(() => {})
    // setOutputMock = vi.spyOn(core, 'setOutput').mockImplementation()

    // Mock GitHub context
    Object.defineProperty(github, 'context', {
      get: () => ({
        repo: {
          owner: repoOwner,
          repo: repoName
        }
      })
    })
  })

  it('deletes a tag for a non-existing branch', async () => {
    const tagTobeDeleted = 'v1.0.1-iamnotthereanymore.1'

    const octokitMock = {
      rest: {
        repos: {
          listBranches: vi.fn().mockResolvedValue({
            data: [{ name: 'main' }]
          })
        },
        git: {
          listMatchingRefs: vi.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/${tagTobeDeleted}` }]
          }),
          deleteRef: vi.fn().mockResolvedValue({})
        }
      }
    }
    ;(github.getOctokit as unknown as MockInstance).mockReturnValue(octokitMock)

    await main.run()

    // Assuming a function to check tag-to-branch association is implemented
    // and tags v1.0.0 and v1.0.1 do not correspond to any existing branch
    expect(octokitMock.rest.git.deleteRef).toHaveBeenCalledWith({
      owner: repoOwner,
      repo: repoName,
      ref: `tags/${tagTobeDeleted}`
    })
  })

  it('does not delete a tag for an existing branch', async () => {
    const tagToBeNotDeleted = 'v1.0.1-iamstillhere.1'

    const octokitMock = {
      rest: {
        repos: {
          listBranches: vi.fn().mockResolvedValue({
            data: [{ name: 'main' }, { name: 'feature/iamstillhere' }]
          })
        },
        git: {
          listMatchingRefs: vi.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/${tagToBeNotDeleted}` }]
          }),
          deleteRef: vi.fn().mockResolvedValue({})
        }
      }
    }
    ;(github.getOctokit as unknown as MockInstance).mockReturnValue(octokitMock)

    await main.run()

    // Check that deleteRef was not called for tags associated with existing branches
    expect(octokitMock.rest.git.deleteRef).not.toHaveBeenCalledWith({
      owner: repoOwner,
      repo: repoName,
      ref: `tags/${tagToBeNotDeleted}`
    })
  })

  it('never deletes tags on the main branch', async () => {
    const tagToBeNotDeleted = 'v1.0.1'

    const octokitMock = {
      rest: {
        repos: {
          listBranches: vi.fn().mockResolvedValue({
            data: [{ name: 'main' }, { name: 'feature/iamstillhere' }] // Only the data needed for this test
          })
        },
        git: {
          listMatchingRefs: vi.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/${tagToBeNotDeleted}` }]
          }),
          deleteRef: vi.fn().mockResolvedValue({})
        }
      }
    }
    ;(github.getOctokit as unknown as MockInstance).mockReturnValue(octokitMock)

    await main.run()

    expect(octokitMock.rest.git.deleteRef).not.toHaveBeenCalledWith({
      owner: repoOwner,
      repo: repoName,
      ref: `tags/${tagToBeNotDeleted}`
    })
  })

  it('should fail if a GitHub REST call throws an error', async () => {
    const errorMessage = 'GitHub API error'
    const octokitMock = {
      rest: {
        repos: {
          listBranches: vi.fn().mockRejectedValue(new Error(errorMessage))
        },
        git: {
          listMatchingRefs: vi.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/v1.0.1}` }]
          }),
          deleteRef: vi.fn().mockResolvedValue({})
        }
      }
    }

    ;(github.getOctokit as unknown as MockInstance).mockReturnValue(octokitMock)

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, errorMessage)
  })

  it('should fail if a GitHub REST call throws an unknown error', async () => {
    const octokitMock = {
      rest: {
        repos: {
          listBranches: vi.fn().mockRejectedValue('unknown error')
        },
        git: {
          listMatchingRefs: vi.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/v1.0.1}` }]
          }),
          deleteRef: vi.fn().mockResolvedValue({})
        }
      }
    }

    ;(github.getOctokit as unknown as MockInstance).mockReturnValue(octokitMock)

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'An unknown error occurred'
    )
  })
})
