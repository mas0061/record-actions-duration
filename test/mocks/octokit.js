function mockOctokit(responses) {
  return {
    actions: {
      listWorkflowRuns: jest.fn().mockImplementation(() => responses.actions.listWorkflowRuns()),
      getWorkflowRunUsage: jest.fn().mockImplementation(() => responses.actions.getWorkflowRunUsage())
    }
  };
}

module.exports = { mockOctokit };