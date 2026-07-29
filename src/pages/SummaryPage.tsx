import { useMemo } from 'react'
import { BandBadge } from '../components/BandBadge'
import { useDiary } from '../context/DiaryContext'
import { formatDisplayDate, listDateKeys, todayKey } from '../lib/dates'
import { ageReferenceTable, calcEbc, mvvLowerLimit, tvvUpperLimit } from '../lib/ebc'
import {
  interpretDay,
  interpretNight,
  overallConclusion,
} from '../lib/interpret'

export function SummaryPage() {
  const { profile, data, getDay, getNight } = useDiary()

  const dayStart = data.daytimeSessionStart ?? todayKey()
  const nightStart = data.nighttimeSessionStart ?? todayKey()
  const dayTarget = profile?.daytimeTargetDays ?? 4
  const nightTarget = profile?.nighttimeTargetNights ?? 7
  const ageYears = profile?.ageYears ?? 8

  const dayKeys = listDateKeys(dayStart, dayTarget)
  const nightKeys = listDateKeys(nightStart, nightTarget)

  const dayInterps = useMemo(
    () => dayKeys.map((d) => interpretDay(getDay(d), ageYears)),
    [dayKeys, getDay, ageYears],
  )
  const nightInterps = useMemo(
    () => nightKeys.map((d) => interpretNight(getNight(d), ageYears)),
    [nightKeys, getNight, ageYears],
  )
  const conclusion = overallConclusion(dayInterps, nightInterps)
  const ebc = calcEbc(ageYears)

  if (!profile) return null

  return (
    <div>
      <header className="brand">
        <h1>汇总解读</h1>
        <p className="slogan">给家长看的白话 · 给医生看的数据</p>
      </header>

      <section className="card">
        <h2>
          {profile.childName} · {profile.ageYears} 岁
        </h2>
        <p className="hint">
          估算膀胱容量 EBC = {ebc} ml；日间 MVV 参考下限 {mvvLowerLimit(ebc)} ml；
          夜间 TVV 参考上限 {tvvUpperLimit(ebc)} ml。
        </p>
        <p className="hint">{conclusion.plain}</p>
        <p className="disclaimer">本页内容仅供记录与就诊参考，不能代替医生诊断或治疗建议。</p>
        <button type="button" className="btn btn-primary btn-block no-print" onClick={() => window.print()}>
          打印 / 导出为 PDF
        </button>
      </section>

      <section className="card">
        <h3>日间记录（家长版）</h3>
        <div className="stack">
          {dayInterps.map((d) => (
            <div key={d.date} className="timeline-item">
              <div className="meta">
                <strong>{formatDisplayDate(d.date)}</strong>
                <span className="tag">
                  MVV {d.mvv == null ? '—' : `${d.mvv} ml`}
                </span>
              </div>
              <BandBadge band={d.band} />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>夜间记录（家长版）</h3>
        <div className="stack">
          {nightInterps.map((n) => (
            <div key={n.date} className="timeline-item">
              <div className="meta">
                <strong>{formatDisplayDate(n.date)}</strong>
                <span className="tag">
                  TVV {n.tvv == null ? '—' : `${n.tvv} ml`}
                </span>
              </div>
              <BandBadge band={n.band} />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>医生数据表</h3>
        <p className="hint">可直接出示或打印。日间含饮水、排尿、漏尿；夜间含 TVV 与是否尿床。</p>
        <h4 style={{ margin: '12px 0 8px' }}>日间</h4>
        <table className="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>饮水次数</th>
              <th>总饮水</th>
              <th>排尿次数</th>
              <th>MVV</th>
              <th>漏尿</th>
            </tr>
          </thead>
          <tbody>
            {dayKeys.map((d) => {
              const day = getDay(d)
              const intakeSum = day.intakes.reduce((s, x) => s + x.volumeMl, 0)
              const mvv = dayInterps.find((x) => x.date === d)?.mvv
              return (
                <tr key={d}>
                  <td>{d}</td>
                  <td>{day.intakes.length}</td>
                  <td>{intakeSum} ml</td>
                  <td>{day.voids.length}</td>
                  <td>{mvv == null ? '—' : `${mvv}`}</td>
                  <td>{day.voids.filter((v) => v.leak).length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <h4 style={{ margin: '16px 0 8px' }}>夜间</h4>
        <table className="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>睡觉</th>
              <th>起床</th>
              <th>尿床</th>
              <th>TVV</th>
              <th>大便</th>
            </tr>
          </thead>
          <tbody>
            {nightKeys.map((d) => {
              const n = getNight(d)
              const tvv = nightInterps.find((x) => x.date === d)?.tvv
              return (
                <tr key={d}>
                  <td>{d}</td>
                  <td>{n.sleepTime}</td>
                  <td>{n.wakeTime}</td>
                  <td>{n.bedwet ? '有' : '无'}</td>
                  <td>{tvv == null ? '—' : `${tvv}`}</td>
                  <td>{n.bowel ? '有' : '无'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>年龄参考表</h3>
        <table className="table">
          <thead>
            <tr>
              <th>年龄</th>
              <th>EBC</th>
              <th>MVV 下限 65%</th>
              <th>TVV 上限 130%</th>
            </tr>
          </thead>
          <tbody>
            {ageReferenceTable().map((r) => (
              <tr key={r.age} style={r.age === profile.ageYears || (profile.ageYears >= 12 && r.age === 12) ? { fontWeight: 700 } : undefined}>
                <td>{r.age >= 12 ? '12–18' : r.age}</td>
                <td>{r.ebc}</td>
                <td>{r.mvvMin}</td>
                <td>{r.tvvMax}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
