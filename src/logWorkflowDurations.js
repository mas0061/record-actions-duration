const core = require('@actions/core')

const { formatDuration } = require('./durations')

async function logWorkflowDurations(octokit, owner, repo, workflowName) {
  try {
    const runs = await getWorkflowRuns(octokit, owner, repo, workflowName)

    const durations = await Promise.all(
      runs.map(async (run) => {
        if (!run.id || !run.created_at) return null

        const { data: duration } = await octokit.rest.actions.getWorkflowRunUsage({
          owner,
          repo,
          run_id: run.id,
        })

        if (!duration.run_duration_ms) return null

        const durationFormatted = formatDuration(duration.run_duration_ms)
        return { id: run.id, duration: durationFormatted, created_at: run.created_at }
      }),
    )

    // Filter out null values
    return durations.filter((duration) => duration !== null)
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

async function getWorkflowRuns(octokit, owner, repo, workflowName) {
  const { data: actionsRun } = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowName,
  })

  return actionsRun.workflow_runs
}

module.exports = {
  logWorkflowDurations,
}
