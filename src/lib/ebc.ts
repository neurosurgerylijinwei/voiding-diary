/** 预期膀胱容量 EBC = (年龄 + 1) × 30 ml（新华医院儿泌排尿日记） */
export function calcEbc(ageYears: number): number {
  const age = Math.max(0, Math.min(18, Math.floor(ageYears)))
  if (age >= 12) return 390
  return (age + 1) * 30
}

export function mvvLowerLimit(ebc: number): number {
  return Math.round(ebc * 0.65)
}

export function tvvUpperLimit(ebc: number): number {
  return Math.round(ebc * 1.3)
}

export function ageReferenceTable(): {
  age: number
  ebc: number
  mvvMin: number
  tvvMax: number
}[] {
  const ages = [5, 6, 7, 8, 9, 10, 11, 12]
  return ages.map((age) => {
    const ebc = calcEbc(age)
    return {
      age,
      ebc,
      mvvMin: mvvLowerLimit(ebc),
      tvvMax: tvvUpperLimit(ebc),
    }
  })
}

/** 尿布尿量：湿重 - 干重，1g ≈ 1ml */
export function diaperUrineMl(
  wetG: number | null | undefined,
  dryG: number | null | undefined,
): number | null {
  if (wetG == null || dryG == null) return null
  if (Number.isNaN(wetG) || Number.isNaN(dryG)) return null
  const ml = Math.round(wetG - dryG)
  return ml >= 0 ? ml : null
}
