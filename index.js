const core = require('@actions/core')
const github = require('@actions/github')

const format = require('date-fns/format')
const parseISO = require('date-fns/parseISO')

async function run() {
  try {
    const repositoryName = core.getInput('repository_name')
    const workflowName = core.getInput('workflow_name')

    const token = core.getInput('token')
    const octokit = github.getOctokit(token)

    core.info(repositoryName)
    core.info(workflowName)

    const runs = await getWorkflowRuns(octokit, repositoryName, workflowName)

    for (const run of runs) {
      const { data: duration } = await octokit.rest.actions.getWorkflowRunUsage({
        owner: repositoryName.split('/')[0],
        repo: repositoryName.split('/')[1],
        run_id: run.id
      })
      core.info(`${run.id}: ${duration.run_duration_ms}ms: ${format(parseISO(run.created_at), 'yyyy/MM/dd HH:mm:ss')}`)
    }
  } catch(error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

async function getWorkflowRuns(octokit, repositoryName, workflowName) {
  const { data: actionsRun } = await octokit.rest.actions.listWorkflowRuns({
    owner: repositoryName.split('/')[0],
    repo: repositoryName.split('/')[1],
    workflow_id: workflowName
  })
  return actionsRun.workflow_runs
}

run()