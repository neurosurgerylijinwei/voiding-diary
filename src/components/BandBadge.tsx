import type { CapacityBand, NightBand } from '../types'

export function BandBadge({
  band,
}: {
  band: CapacityBand | NightBand | 'insufficient'
}) {
  if (band === 'insufficient') {
    return <span className="badge badge-muted">记录不足</span>
  }
  if (band === 'small') {
    return <span className="badge badge-warn">容量可能偏小</span>
  }
  if (band === 'polyuria' || band === 'large') {
    return <span className="badge badge-alert">尿量可能偏多</span>
  }
  return <span className="badge badge-ok">大致常见范围</span>
}
