/**
 * Unit tests for the action's main functionality, src/main.js
 */
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as main from '../src/main'

// Mock the GitHub Actions core library
// let debugMock: jest.SpiedFunction<typeof core.debug>
// let errorMock: jest.SpiedFunction<typeof core.error>
// let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
// let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
let mockContexxt = {
  repo: {
    owner: 'mockOwner',
    repo: 'mockRepo'
  }

}

//jest.mock('@actions/core')
jest.mock('@actions/github')


// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // debugMock = jest.spyOn(core, 'debug').mockImplementation()
    // errorMock = jest.spyOn(core, 'error').mockImplementation()
    // getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    // setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    // Mock GitHub context
    Object.defineProperty(github, 'context', {
      get: () => mockContexxt
    }
  )
  }
)

  it('deletes a tag for a non-existing branch', async () => {
    const tagTobeDeleted = 'v1.0.1-iamnotthereanymore.1'

    const octokitMock = {
      rest: {
        repos: {
          listBranches: jest.fn().mockResolvedValue({
            data: [{ name: 'main' }] // Only the data needed for this test
          })
        },
        git: {
          listMatchingRefs: jest.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/${tagTobeDeleted}` }]
          }),
          deleteRef: jest.fn().mockResolvedValue({})
        }
      }
    }
    ;(github.getOctokit as jest.Mock).mockReturnValue(octokitMock)

    await main.run()

    // Assuming a function to check tag-to-branch association is implemented
    // and tags v1.0.0 and v1.0.1 do not correspond to any existing branch
    expect(octokitMock.rest.git.deleteRef).toHaveBeenCalledWith({
      owner: 'mockOwner',
      repo: 'mockRepo',
      ref: `refs/tags/${tagTobeDeleted}`
    });
  })

  it('does not delete a tag for an existing branch', async () => {
    const tagToBeNotDeleted = 'v1.0.1-iamstillhere.1'

    const octokitMock = {
      rest: {
        repos: {
          listBranches: jest.fn().mockResolvedValue({
            data: [{ name: 'main' }, { name: 'feature/iamstillhere' }] // Only the data needed for this test
          })
        },
        git: {
          listMatchingRefs: jest.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/${tagToBeNotDeleted}` }]
          }),
          deleteRef: jest.fn().mockResolvedValue({})
        }
      }
    }
    ;(github.getOctokit as jest.Mock).mockReturnValue(octokitMock)

    await main.run()

    // Check that deleteRef was not called for tags associated with existing branches
    expect(octokitMock.rest.git.deleteRef).not.toHaveBeenCalledWith({
      owner: 'mockOwner',
      repo: 'mockRepo',
      ref: `tags/${tagToBeNotDeleted}`
    })
  })

  it('never deletes tags on the main branch', async () => {
    const octokitMock = {
      rest: {
        repos: {
          listBranches: jest.fn().mockResolvedValue({
            data: [{ name: 'main' }, { name: 'feature/iamstillhere' }] // Only the data needed for this test
          })
        },
        git: {
          listMatchingRefs: jest.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/v1.0.1}` }]
          }),
          deleteRef: jest.fn().mockResolvedValue({})
        }
      }
    }
    ;(github.getOctokit as jest.Mock).mockReturnValue(octokitMock)

    await main.run()

    expect(octokitMock.rest.git.deleteRef).not.toHaveBeenCalledWith({
      owner: 'mockOwner',
      repo: 'mockRepo',
      ref: 'tags/v1.0.1'
    })
  })

  it('should fail if a GitHub REST call throws an error', async () => {
    // Arrange
    const errorMessage = 'GitHub API error'
    const octokitMock = {
      rest: {
        repos: {
          listBranches: jest.fn().mockRejectedValue(new Error(errorMessage))
        },
        git: {
          listMatchingRefs: jest.fn().mockResolvedValue({
            data: [{ ref: `refs/tags/v1.0.1}` }]
          }),
          deleteRef: jest.fn().mockResolvedValue({})
        }
      }
    };
    
    (github.getOctokit as jest.Mock).mockReturnValue(octokitMock)

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, errorMessage)
  })
})
