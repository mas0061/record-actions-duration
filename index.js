const core = require('@actions/core')

async function run() {
  try {
    const repositoryName = core.getInput('repository_name')
    const workflowName = core.getInput('workflow_name')

    console.log(repositoryName)
    console.log(workflowName)
  } catch(error) {
    core.setFailed(error.message)
  }
}
