/**
 * @file utils for time
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import moment from 'moment'

// 该函数用于获取指定日期类型的时间范围，比如本月、上个月、本年
export function getMomentRangeBaseDuration(
  duration?: moment.unitOfTime.DurationConstructor,
  initTime?: moment.MomentInput
): [moment.Moment, moment.Moment] {
  duration = duration || 'day'
  const time = initTime || new Date()
  const start = moment(time).startOf(duration)
  const end = moment(time).endOf(duration)
  return [start, end]
}

// 该函数用于将时间区间格式化
export function getFormattedDateRangeValue(
  dateRange: [moment.Moment, moment.Moment],
  format = 'YYYYMMDDHHmmss'
): [string, string] {
  return [dateRange[0].format(format), dateRange[1].format(format)]
}

// 获取距指定一定时间段的时间范围，比如最近七天...
export function getLatestDuration(
  value: number,
  unit: moment.unitOfTime.DurationConstructor,
  time?: moment.Moment
): [moment.Moment, moment.Moment] {
  const end = time || new Date()
  const start = moment(end).subtract(value, unit).startOf(unit)
  if (unit === 'day' || unit === 'd' || unit === 'days') {
    return [start, moment(end).endOf(unit)]
  }

  return [start, moment(end)]
}

export function humanizeTimestamp(timestamp: number, format = 'YYYY-MM-DD') {
  return moment(timestamp).format(format)
}

export function getFormattedDate(date: [moment.Moment, moment.Moment]) {
  const [begin, end] = getFormattedDateRangeValue(date)
  return { begin, end }
}

export function getMonthData() {
  const currentMonth = getMomentRangeBaseDuration('month') // 本月
  const lastMonth = getMomentRangeBaseDuration('month', moment().subtract(1, 'month')) // 上月
  return { currentMonth, lastMonth }
}

// 判断传入的 deadTime 是否早于当前时间
export function isOverdue(deadTime: number | string) {
  return moment(deadTime).isBefore(moment())
}
