import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDiary } from '../context/DiaryContext'
import { formatDisplayDate, listDateKeys, todayKey } from '../lib/dates'
import { nightTvv } from '../lib/interpret'

export function ProgressPage() {
  const { profile, data, getDay, getNight, ensureSessions } = useDiary()

  useEffect(() => {
    ensureSessions()
  }, [ensureSessions])

  if (!profile) return null

  const dayStart = data.daytimeSessionStart ?? todayKey()
  const nightStart = data.nighttimeSessionStart ?? todayKey()
  const dayKeys = listDateKeys(dayStart, profile.daytimeTargetDays)
  const nightKeys = listDateKeys(nightStart, profile.nighttimeTargetNights)

  const dayDone = dayKeys.filter((d) => {
    const day = getDay(d)
    return day.voids.length > 0
  }).length
  const nightDone = nightKeys.filter((d) => {
    const n = getNight(d)
    return nightTvv(n) != null || n.bedwet || n.bowel
  }).length

  return (
    <div>
      <header className="brand">
        <h1>记录进度</h1>
        <p className="slogan">按医院常用节奏完成日记</p>
      </header>

      <section className="card">
        <h2>日间日记 · {dayDone}/{profile.daytimeTargetDays} 天</h2>
        <p className="hint">建议连续记录 3–4 天：每次饮水、排尿时间和尿量，以及有无漏尿。</p>
        <div className="progress-bars">
          <div className="progress-row">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(dayDone / profile.daytimeTargetDays) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="stack" style={{ marginTop: 12 }}>
          {dayKeys.map((d) => {
            const day = getDay(d)
            const ok = day.voids.length > 0
            return (
              <div className="timeline-item" key={d}>
                <div className="meta">
                  <strong>{formatDisplayDate(d)}</strong>
                  <span className="tag">
                    饮水 {day.intakes.length} · 排尿 {day.voids.length}
                    {day.voids.some((v) => v.leak) ? ' · 有漏尿' : ''}
                  </span>
                </div>
                <span className={`badge ${ok ? 'badge-ok' : 'badge-muted'}`}>
                  {ok ? '已记' : '待记'}
                </span>
              </div>
            )
          })}
        </div>
        <Link to="/" className="btn btn-primary btn-block" style={{ marginTop: 12 }}>
          去记今天日间
        </Link>
      </section>

      <section className="card">
        <h2>夜间日记 · {nightDone}/{profile.nighttimeTargetNights} 晚</h2>
        <p className="hint">建议连续 7 个夜晚：睡觉/起床、是否尿床、尿布称重、晨尿、大便。</p>
        <div className="progress-bars">
          <div className="progress-row">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${(nightDone / profile.nighttimeTargetNights) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="stack" style={{ marginTop: 12 }}>
          {nightKeys.map((d) => {
            const n = getNight(d)
            const tvv = nightTvv(n)
            const ok = tvv != null || n.bedwet
            return (
              <Link className="timeline-item" key={d} to={`/night/${d}`}>
                <div className="meta">
                  <strong>{formatDisplayDate(d)}</strong>
                  <span className="tag">
                    {n.bedwet ? '尿床 · ' : ''}
                    TVV {tvv == null ? '—' : `${tvv} ml`}
                    {n.bowel ? ' · 有大便' : ''}
                  </span>
                </div>
                <span className={`badge ${ok ? 'badge-ok' : 'badge-muted'}`}>
                  {ok ? '已记' : '去填'}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
