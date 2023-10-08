function formatDuration(durationInMs) {
  const durationInSec = durationInMs / 1000;
  const hours = Math.floor(durationInSec / 3600);
  const minutes = Math.floor((durationInSec % 3600) / 60);
  const seconds = Math.floor(durationInSec % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = { formatDuration };