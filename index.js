const core = require('@actions/core')
const github = require('@actions/github')

const format = require('date-fns/format')
const parseISO = require('date-fns/parseISO')

const { formatDuration } = require('./durations')

async function run(owner, repo, workflowName, token) {
  try {
    const octokit = github.getOctokit(token)

    core.info(`${owner}/${repo}`)
    core.info(workflowName)

    const runs = await getWorkflowRuns(octokit, owner, repo, workflowName)

    for (const run of runs) {
      const { data: duration } = await octokit.rest.actions.getWorkflowRunUsage({
        owner,
        repo,
        run_id: run.id
      })
      // run.idが取得できない、duration.run_duration_msが取得できない、run.created_atが取得できない場合は次のループに移る
      if (!run.id || !duration.run_duration_ms || !run.created_at) {
        continue
      }

      const durationFormatted = formatDuration(duration.run_duration_ms)
      core.info(`${run.id}, ${durationFormatted}, ${format(parseISO(run.created_at), 'yyyy/MM/dd HH:mm:ss')}`)
    }
  } catch(error) {
    core.error(error)
    core.setFailed(error.message)
    process.exit(1)
  }
}

async function getWorkflowRuns(octokit, owner, repo, workflowName) {
  const { data: actionsRun } = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowName
  })

  return actionsRun.workflow_runs
}

const repositoryName = core.getInput('repository_name')
// repositoryNameが / で2つの文字列に分割でき、それぞれの文字列長が1以上ない場合はエラーになる
if (!repositoryName || repositoryName.split('/').length !== 2 || repositoryName.split('/').some((name) => name.length === 0)) {
  core.setFailed('Invalid repository name. It should be in the format "owner/repo".')
  process.exit(1)
}

const [owner, repo] = repositoryName.split('/')
const workflowName = core.getInput('workflow_name')
const token = core.getInput('token')

run(owner, repo, workflowName, token).catch(error =>{
  core.error(error)
  core.setFailed(error.message)
  process.exit(1)
})