const core = require('@actions/core')
const github = require('@actions/github')

const { logWorkflowDurations } = require('./logWorkflowDurations')

const repositoryName = core.getInput('repository_name')
// repositoryNameが / で2つの文字列に分割でき、それぞれの文字列長が1以上ない場合はエラーになる
if (!repositoryName || repositoryName.split('/').length !== 2 || repositoryName.split('/').some((name) => name.length === 0)) {
  core.setFailed('Invalid repository name. It should be in the format "owner/repo".')
  process.exit(1)
}

const [owner, repo] = repositoryName.split('/')
const workflowName = core.getInput('workflow_name')
const token = core.getInput('token')

const octokit = github.getOctokit(token)

core.info(`${owner}/${repo}`)
core.info(workflowName)

logWorkflowDurations(octokit, owner, repo, workflowName, token).catch(error =>{
  core.error(error)
  core.setFailed(error.message)
  process.exit(1)
})