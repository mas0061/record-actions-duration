import fs from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'

import logWorkflowDurations from './logWorkflowDurations'

const repositoryName: string = process.env.REPOSITORY_NAME
// repositoryNameが / で2つの文字列に分割でき、それぞれの文字列長が1以上ない場合はエラーになる
if (
  !repositoryName ||
  repositoryName.split('/').length !== 2 ||
  repositoryName.split('/').some((name) => name.length === 0)
) {
  core.setFailed('Invalid repository name. It should be in the format "owner/repo".')
  process.exit(1)
}

const [owner, repo]: string[] = repositoryName.split('/')
const workflowName: string = process.env.WORKFLOW_NAME
const token: string = process.env.TOKEN

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
