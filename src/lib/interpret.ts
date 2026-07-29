import { calcEbc, diaperUrineMl, mvvLowerLimit, tvvUpperLimit } from './ebc'
import type {
  CapacityBand,
  DayInterpretation,
  DayRecord,
  NightBand,
  NightInterpretation,
  NightRecord,
  VoidEntry,
} from '../types'

/** 日间最大尿量：取当日最大单次；若有多条，排除最早一条作为「晨起第一泡」的常见做法可选 */
export function daytimeMvv(
  voids: VoidEntry[],
  excludeEarliest = true,
): number | null {
  if (!voids.length) return null
  const sorted = [...voids].sort((a, b) => a.time.localeCompare(b.time))
  const candidates =
    excludeEarliest && sorted.length > 1 ? sorted.slice(1) : sorted
  if (!candidates.length) return null
  return Math.max(...candidates.map((v) => v.volumeMl))
}

export function nightTvv(night: NightRecord): number | null {
  const diaper = diaperUrineMl(night.wetDiaperG, night.dryDiaperG)
  const nightSum = night.nightVoids.reduce((s, v) => s + v.volumeMl, 0)
  const morning = night.morningVoidMl ?? 0
  const hasAny =
    diaper != null ||
    night.nightVoids.length > 0 ||
    night.morningVoidMl != null
  if (!hasAny) return null
  return (diaper ?? 0) + nightSum + morning
}

export function interpretDay(
  day: DayRecord,
  ageYears: number,
): DayInterpretation {
  const ebc = calcEbc(ageYears)
  const threshold = mvvLowerLimit(ebc)
  const mvv = daytimeMvv(day.voids)
  if (mvv == null) {
    return {
      date: day.date,
      ebc,
      mvv: null,
      mvvThreshold: threshold,
      band: 'insufficient',
      plain:
        '今天还没有足够的排尿记录。请用量杯记下白天每一次尿量，系统才能估算膀胱容量。',
    }
  }

  let band: CapacityBand
  let plain: string
  if (mvv < threshold) {
    band = 'small'
    plain = `今天白天最大一次尿量约 ${mvv} ml（参考下限约 ${threshold} ml，按年龄估算膀胱容量 ${ebc} ml）。可能提示功能性膀胱容量偏小。就诊时把这份日记给医生看即可，请勿自行下诊断。`
  } else if (mvv > ebc * 1.3) {
    band = 'large'
    plain = `今天白天最大一次尿量约 ${mvv} ml（估算膀胱容量 ${ebc} ml）。单次量偏大，也可能与饮水较多有关。建议连同饮水记录一起给医生看。`
  } else {
    band = 'normal'
    plain = `今天白天最大一次尿量约 ${mvv} ml（常见参考约 ${threshold}–${Math.round(ebc * 1.3)} ml）。大致落在年龄常见范围内。完整日记仍建议就诊时带上。`
  }

  return { date: day.date, ebc, mvv, mvvThreshold: threshold, band, plain }
}

export function interpretNight(
  night: NightRecord,
  ageYears: number,
): NightInterpretation {
  const ebc = calcEbc(ageYears)
  const threshold = tvvUpperLimit(ebc)
  const tvv = nightTvv(night)
  if (tvv == null) {
    return {
      date: night.date,
      ebc,
      tvv: null,
      tvvThreshold: threshold,
      band: 'insufficient',
      plain:
        '今晚还缺夜间尿量数据。可称干/湿尿布（1g≈1ml），并记下起夜与晨起第一次尿量。',
    }
  }

  let band: NightBand
  let plain: string
  if (tvv > threshold) {
    band = 'polyuria'
    plain = `昨夜夜间总尿量约 ${tvv} ml（参考上限约 ${threshold} ml，估算膀胱容量 ${ebc} ml）。可能有夜间尿量偏多的倾向。可留意晚饭后少喝、睡前排空；具体方案请咨询医生。`
  } else {
    band = 'normal'
    plain = `昨夜夜间总尿量约 ${tvv} ml（参考上限约 ${threshold} ml）。目前未见明显超过常见上限。继续记满 7 晚更有参考价值。`
  }

  return { date: night.date, ebc, tvv, tvvThreshold: threshold, band, plain }
}

export function overallConclusion(
  days: DayInterpretation[],
  nights: NightInterpretation[],
): { code: 'polyuria' | 'small' | 'both' | 'normal' | 'incomplete'; plain: string } {
  const dayReady = days.filter((d) => d.band !== 'insufficient')
  const nightReady = nights.filter((n) => n.band !== 'insufficient')
  if (!dayReady.length && !nightReady.length) {
    return {
      code: 'incomplete',
      plain: '记录还不够。请先完成若干完整的日间日记和夜间日记，再查看汇总解读。',
    }
  }

  const small = dayReady.some((d) => d.band === 'small')
  const poly = nightReady.some((n) => n.band === 'polyuria')

  if (small && poly) {
    return {
      code: 'both',
      plain:
        '目前日记提示：白天最大尿量有偏小倾向，同时夜间总尿量有偏多倾向。这两种情况可以同时存在。请把完整日记交给医生，由医生结合检查综合判断。本解读仅供家长参考，不能代替诊断。',
    }
  }
  if (poly) {
    return {
      code: 'polyuria',
      plain:
        '目前日记提示：夜间总尿量有偏多倾向（夜间多尿倾向）。就诊时可重点与医生讨论夜间饮水和夜尿管理。本解读仅供参考。',
    }
  }
  if (small) {
    return {
      code: 'small',
      plain:
        '目前日记提示：白天最大尿量有偏小倾向（功能性膀胱容量可能减少）。就诊时请带上完整日间记录。本解读仅供参考。',
    }
  }
  return {
    code: 'normal',
    plain:
      '根据已记录的天数，白天最大尿量与夜间总尿量暂未见明显偏离常见参考范围。即使如此，完整日记仍对医生很有帮助，请继续记满并就诊时出示。',
  }
}
