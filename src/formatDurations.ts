export default (durationInMs: number): string => {
  const durationInSec: number = durationInMs / 1000
  const hours: number = Math.floor(durationInSec / 3600)
  const minutes: number = Math.floor((durationInSec % 3600) / 60)
  const seconds: number = Math.floor(durationInSec % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}
