import formatDuration from '@/formatDurations'

describe('formatDuration', () => {
  it('should format duration in milliseconds to HH:mm:SS', () => {
    expect(formatDuration(0)).toBe('00:00:00')
    expect(formatDuration(1000)).toBe('00:00:01')
    expect(formatDuration(60000)).toBe('00:01:00')
    expect(formatDuration(3600000)).toBe('01:00:00')
    expect(formatDuration(123456789)).toBe('34:17:36')
  })
})
