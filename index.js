const core = require('@actions/core')

async function run() {
  try {
    const repositoryName = core.getInput('repository_name')
    const workflowName = core.getInput('workflow_name')

    core.info(repositoryName)
    core.info(workflowName)
  } catch(error) {
    core.setFailed(error.message)
  }
}

run()