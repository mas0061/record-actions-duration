import { logWorkflowDurations } from './logWorkflowDurations';

describe('logWorkflowDurations', () => {
  it('should log workflow run durations', async () => {
    const owner = 'owner';
    const repo = 'repo';
    const workflowName = 'workflowName';

    const octokit = {
      rest: {
        actions: {
          listWorkflowRuns: vi.fn().mockResolvedValue({
            data: {
              workflow_runs: [
                { id: 1, created_at: '2022/01/01T00:00:00Z' },
                { id: 2, created_at: '2022/01/02T00:00:00Z' },
                { id: 3, created_at: '2022/01/03T00:00:00Z' }
            ]}
          }),
          getWorkflowRunUsage: vi.fn()
            .mockResolvedValueOnce({ data: { run_duration_ms: 123456789 } })
            .mockResolvedValueOnce({ data: { run_duration_ms: 123457789 } })
            .mockResolvedValueOnce({ data: { run_duration_ms: 123458789 } })
        }
      }
    };

    const expectedDurations = [
      { id: 1, duration: '34:17:36', created_at: '2022/01/01T00:00:00Z' },
      { id: 2, duration: '34:17:37', created_at: '2022/01/02T00:00:00Z' },
      { id: 3, duration: '34:17:38', created_at: '2022/01/03T00:00:00Z' }
    ];

    const actualDurations = await logWorkflowDurations(octokit, owner, repo, workflowName);

    expect(actualDurations).toEqual(expectedDurations);
  });

  it('should return an empty array if no runs are found', async () => {
    const owner = 'owner';
    const repo = 'repo';
    const workflowName = 'workflowName';

    const octokit = {
      rest: {
        actions: {
          listWorkflowRuns: vi.fn().mockResolvedValue({
            data: {
              workflow_runs: []
            }
          })
        }
      }
    };

    const expectedDurations = [];

    const actualDurations = await logWorkflowDurations(octokit, owner, repo, workflowName);

    expect(actualDurations).toEqual(expectedDurations);
  });

  it('should return an empty array if runs are found but no duration data is available', async () => {
    const owner = 'owner';
    const repo = 'repo';
    const workflowName = 'workflowName';

    const octokit = {
      rest: {
        actions: {
          listWorkflowRuns: vi.fn().mockResolvedValue({
            data: {
              workflow_runs: [
                { id: 1, created_at: '2022/01/01T00:00:00Z' }
              ]
            }
          }),
          getWorkflowRunUsage: vi.fn().mockResolvedValue({
            data: {}
          })
        }
      }
    };

    const expectedDurations = [];

    const actualDurations = await logWorkflowDurations(octokit, owner, repo, workflowName);

    expect(actualDurations).toEqual(expectedDurations);
  });

  it('should return an empty array if runs are found but some data is missing', async () => {
    const owner = 'owner';
    const repo = 'repo';
    const workflowName = 'workflowName';

    const octokit = {
      rest: {
        actions: {
          listWorkflowRuns: vi.fn().mockResolvedValue({
            data: {
              workflow_runs: [
                { id: 1, created_at: '2022/01/01T00:00:00Z' },
                { id: 2 },
                { created_at: '2022/01/03T00:00:00Z' }
              ]
            }
          }),
          getWorkflowRunUsage: vi.fn().mockResolvedValue({
            data: { run_duration_ms: 123456789 }
          })
        }
      }
    };

    const expectedDurations = [
      { id: 1, duration: '34:17:36', created_at: '2022/01/01T00:00:00Z' }
    ];

    const actualDurations = await logWorkflowDurations(octokit, owner, repo, workflowName);

    expect(actualDurations).toEqual(expectedDurations);
  });
});