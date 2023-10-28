const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')

const { logWorkflowDurations } = require('./logWorkflowDurations')

const repositoryName = core.getInput('repository_name')
// repositoryNameが / で2つの文字列に分割でき、それぞれの文字列長が1以上ない場合はエラーになる
if (
  !repositoryName ||
  repositoryName.split('/').length !== 2 ||
  repositoryName.split('/').some((name) => name.length === 0)
) {
  core.setFailed('Invalid repository name. It should be in the format "owner/repo".')
  process.exit(1)
}

const [owner, repo] = repositoryName.split('/')
const workflowName = core.getInput('workflow_name')
const token = core.getInput('token')

const octokit = github.getOctokit(token)

core.info(`${owner}/${repo}`)
core.info(workflowName)

const durations = logWorkflowDurations(octokit, owner, repo, workflowName).catch((error) => {
  core.error(error)
  core.setFailed(error.message)
  process.exit(1)
})

// durationsを1つずつcore.infoで出力する
durations.then((durations) => {
  const data = JSON.stringify(durations)
  fs.writeFile('actions-duration.json', data, (err) => {
    if (err) throw err
    core.info('The file has been saved!')
  })

  durations.forEach((duration) => {
    core.info(`${duration.id}, ${duration.duration}, ${duration.created_at}`)
  })
})
