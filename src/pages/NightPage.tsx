import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BandBadge } from '../components/BandBadge'
import { useDiary } from '../context/DiaryContext'
import { formatDisplayDate, todayKey, uid } from '../lib/dates'
import { diaperUrineMl } from '../lib/ebc'
import { interpretNight, nightTvv } from '../lib/interpret'
import type { NightRecord } from '../types'

export function NightPage() {
  const { date: dateParam } = useParams()
  const date = dateParam || todayKey()
  const { profile, getNight, saveNight } = useDiary()
  const existing = getNight(date)
  const [form, setForm] = useState<NightRecord>(existing)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(getNight(date))
    setSaved(false)
  }, [date, getNight])

  const diaperMl = diaperUrineMl(form.wetDiaperG, form.dryDiaperG)
  const tvv = nightTvv(form)
  const interp = useMemo(
    () => (profile ? interpretNight(form, profile.ageYears) : null),
    [form, profile],
  )

  function update<K extends keyof NightRecord>(key: K, value: NightRecord[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    saveNight({ ...form, date })
    setSaved(true)
  }

  if (!profile) return null

  return (
    <div>
      <header className="brand">
        <h1>夜间日记</h1>
        <p className="slogan">Dry nights mean good mornings</p>
      </header>

      <section className="card">
        <h2>{formatDisplayDate(date)} · 夜间卡</h2>
        <p className="hint">
          睡前穿上称过重量的干尿布；起床后再称湿尿布。系统按 <strong>湿重 − 干重</strong> 自动算尿量（1g≈1ml）。
        </p>
      </section>

      <form className="card stack" onSubmit={onSubmit}>
        <div className="row">
          <label className="label">
            睡觉时间
            <input
              type="time"
              value={form.sleepTime}
              onChange={(e) => update('sleepTime', e.target.value)}
            />
          </label>
          <label className="label">
            起床时间
            <input
              type="time"
              value={form.wakeTime}
              onChange={(e) => update('wakeTime', e.target.value)}
            />
          </label>
        </div>

        <label className="label">
          尿床了吗？
          <div className="chips">
            <button
              type="button"
              className={`chip ${!form.bedwet ? 'active' : ''}`}
              onClick={() => update('bedwet', false)}
            >
              没有
            </button>
            <button
              type="button"
              className={`chip ${form.bedwet ? 'active' : ''}`}
              onClick={() => update('bedwet', true)}
            >
              尿床了
            </button>
          </div>
        </label>

        <div className="row">
          <label className="label">
            干尿布重量 b（g）
            <input
              inputMode="decimal"
              placeholder="穿上前"
              value={form.dryDiaperG ?? ''}
              onChange={(e) =>
                update('dryDiaperG', e.target.value === '' ? null : Number(e.target.value))
              }
            />
          </label>
          <label className="label">
            湿尿布重量 a（g）
            <input
              inputMode="decimal"
              placeholder="起床后"
              value={form.wetDiaperG ?? ''}
              onChange={(e) =>
                update('wetDiaperG', e.target.value === '' ? null : Number(e.target.value))
              }
            />
          </label>
        </div>
        <p className="hint">
          尿布尿量：{diaperMl == null ? '待计算' : `${diaperMl} ml`}
        </p>

        <label className="label">
          晨起第一次尿量（ml）
          <input
            inputMode="numeric"
            value={form.morningVoidMl ?? ''}
            onChange={(e) =>
              update('morningVoidMl', e.target.value === '' ? null : Number(e.target.value))
            }
          />
        </label>

        <div>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>起夜上厕所</h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                update('nightVoids', [
                  ...form.nightVoids,
                  { id: uid(), time: form.sleepTime, volumeMl: 50 },
                ])
              }
            >
              添加起夜
            </button>
          </div>
          <p className="hint">夜里醒来去厕所并量了尿，请记在这里。</p>
          <div className="stack">
            {form.nightVoids.map((v, idx) => (
              <div className="row" key={v.id}>
                <label className="label">
                  时间
                  <input
                    type="time"
                    value={v.time}
                    onChange={(e) => {
                      const next = [...form.nightVoids]
                      next[idx] = { ...v, time: e.target.value }
                      update('nightVoids', next)
                    }}
                  />
                </label>
                <label className="label">
                  尿量 ml
                  <input
                    inputMode="numeric"
                    value={v.volumeMl}
                    onChange={(e) => {
                      const next = [...form.nightVoids]
                      next[idx] = { ...v, volumeMl: Number(e.target.value) || 0 }
                      update('nightVoids', next)
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    update(
                      'nightVoids',
                      form.nightVoids.filter((x) => x.id !== v.id),
                    )
                  }
                >
                  删
                </button>
              </div>
            ))}
          </div>
        </div>

        <label className="label">
          大便了吗？
          <div className="chips">
            <button
              type="button"
              className={`chip ${!form.bowel ? 'active' : ''}`}
              onClick={() => update('bowel', false)}
            >
              无
            </button>
            <button
              type="button"
              className={`chip ${form.bowel ? 'active' : ''}`}
              onClick={() => update('bowel', true)}
            >
              有
            </button>
          </div>
          <span className="hint" style={{ margin: 0 }}>
            便秘可能影响排尿，简单勾选即可。
          </span>
        </label>

        <p className="hint">
          夜间总尿量 TVV：<strong>{tvv == null ? '—' : `${tvv} ml`}</strong>
          （尿布尿量 + 起夜尿量 + 晨起第一次）
        </p>

        <button type="submit" className="btn btn-primary btn-block">
          {saved ? '已保存' : '保存夜间卡'}
        </button>
        <Link to="/" className="btn btn-ghost btn-block">
          返回今日
        </Link>
      </form>

      {interp && (
        <section className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>家长解读</h3>
            <BandBadge band={interp.band} />
          </div>
          <p className="hint">{interp.plain}</p>
          <p className="disclaimer">仅供参考，不能代替医生诊断。</p>
        </section>
      )}
    </div>
  )
}
