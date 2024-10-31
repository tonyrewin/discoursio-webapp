export type PeriodType = 'week' | 'month' | 'year' | 'all time'

export const getFromDate = (period: PeriodType): number => {
  const now = new Date()
  let d: Date = now
  switch (period) {
    case 'week': {
      d = new Date(now.setMonth(now.getDay() - 7))
      break
    }
    case 'month': {
      d = new Date(now.setMonth(now.getMonth() - 1))
      break
    }
    case 'year': {
      d = new Date(now.setFullYear(now.getFullYear() - 1))
      break
    }
    default: // 'all time'
      return 0
  }
  return Math.floor(d.getTime() / 1000)
}
