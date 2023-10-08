const core = require('@actions/core')

const { formatDuration } = require('./durations')

async function logWorkflowDurations(octokit, owner, repo, workflowName) {
  try {
    const runs = await getWorkflowRuns(octokit, owner, repo, workflowName)
    const durations = []

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
      durations.push({ id: run.id, duration: durationFormatted, created_at: run.created_at })
    }

    return durations
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

module.exports = {
  logWorkflowDurations
}