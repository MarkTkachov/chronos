async function calculateMillisecondsToNextMonth() {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);
  const maxAge = nextMonth.getTime() - now.getTime();

  return maxAge;
}

module.exports = calculateMillisecondsToNextMonth;