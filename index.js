const core = require('@actions/core')
const github = require('@actions/github')

const format = require('date-fns/format')
const parseISO = require('date-fns/parseISO')

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
      core.info(`${run.id}: ${duration.run_duration_ms}ms: ${format(parseISO(run.created_at), 'yyyy/MM/dd HH:mm:ss')}`)
    }
  } catch(error) {
    core.error(error)
    core.setFailed(error.message)
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
const [owner, repo] = repositoryName.split('/')
const workflowName = core.getInput('workflow_name')
const token = core.getInput('token')

run(owner, repo, workflowName, token)