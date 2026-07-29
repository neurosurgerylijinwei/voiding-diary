import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BandBadge } from '../components/BandBadge'
import { QuickLogModal } from '../components/QuickLogModal'
import { useDiary } from '../context/DiaryContext'
import { addDays, formatDisplayDate, todayKey } from '../lib/dates'
import { calcEbc } from '../lib/ebc'
import { interpretDay, interpretNight } from '../lib/interpret'

type EditState =
  | { mode: 'intake' | 'void'; id?: string }
  | null

export function HomePage() {
  const { date: dateParam } = useParams()
  const navigate = useNavigate()
  const date = dateParam || todayKey()
  const isToday = date === todayKey()
  const {
    profile,
    getDay,
    getNight,
    addIntake,
    addVoid,
    updateIntake,
    updateVoid,
    removeIntake,
    removeVoid,
  } = useDiary()
  const day = getDay(date)
  const night = getNight(date)
  const [edit, setEdit] = useState<EditState>(null)

  const dayInterp = useMemo(
    () => (profile ? interpretDay(day, profile.ageYears) : null),
    [day, profile],
  )
  const nightInterp = useMemo(
    () => (profile ? interpretNight(night, profile.ageYears) : null),
    [night, profile],
  )

  const timeline = useMemo(() => {
    const items = [
      ...day.intakes.map((x) => ({
        id: x.id,
        time: x.time,
        volumeMl: x.volumeMl,
        leak: false as boolean | undefined,
        kind: 'intake' as const,
        label: `饮水 ${x.volumeMl} ml`,
      })),
      ...day.voids.map((x) => ({
        id: x.id,
        time: x.time,
        volumeMl: x.volumeMl,
        leak: x.leak,
        kind: 'void' as const,
        label: `排尿 ${x.volumeMl} ml${x.leak ? ' · 有漏尿' : ''}`,
      })),
    ]
    return items.sort((a, b) => a.time.localeCompare(b.time))
  }, [day])

  if (!profile) return null

  const ebc = calcEbc(profile.ageYears)
  const editingItem = edit?.id
    ? timeline.find((x) => x.id === edit.id && x.kind === edit.mode)
    : undefined

  return (
    <div>
      <header className="brand">
        <h1>排尿日记</h1>
        <p className="slogan">Dry nights mean good mornings</p>
      </header>

      <section className="card">
        <h2>
          {profile.childName} · {formatDisplayDate(date)}
          {!isToday && <span className="badge badge-muted" style={{ marginLeft: 8 }}>补记</span>}
        </h2>
        <p className="hint">
          年龄 {profile.ageYears} 岁，估算膀胱容量 <strong>{ebc} ml</strong>。
          {isToday
            ? '请尽量完整记录今天的饮水与排尿；晚上睡前打开「夜间卡」。'
            : '这是历史日期，可在这里补记或修改当天记录。'}
        </p>
        <div className="row no-print" style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/day/${addDays(date, -1)}`)}
          >
            前一天
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(isToday ? '/' : `/day/${todayKey()}`)}
          >
            今天
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/day/${addDays(date, 1)}`)}
            disabled={date >= todayKey()}
          >
            后一天
          </button>
        </div>
        <div className="big-actions no-print">
          <button type="button" className="btn btn-primary" onClick={() => setEdit({ mode: 'void' })}>
            记排尿
            <small>时间 · 尿量 · 漏尿</small>
          </button>
          <button type="button" className="btn btn-dawn" onClick={() => setEdit({ mode: 'intake' })}>
            记喝水
            <small>水 / 奶 / 汤都算</small>
          </button>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn btn-secondary btn-block" to={`/night/${date}`}>
            {isToday ? '填写今晚夜间卡' : '填写该晚夜间卡'}
          </Link>
        </div>
      </section>

      <section className="card">
        <h3>{isToday ? '今日时间线' : '当天时间线'}</h3>
        <p className="hint">从起床记到睡觉。点一条可以修改；漏记了也可以补上时间。</p>
        {timeline.length === 0 ? (
          <p className="hint">还没有记录。先点上面的大按钮试一条吧。</p>
        ) : (
          <div className="timeline">
            {timeline.map((item) => (
              <div className="timeline-item" key={`${item.kind}-${item.id}`}>
                <button
                  type="button"
                  className="meta"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'inherit',
                    flex: 1,
                  }}
                  onClick={() => setEdit({ mode: item.kind, id: item.id })}
                >
                  <strong>
                    {item.time} · {item.label}
                  </strong>
                  <span className="tag">{item.kind === 'intake' ? '饮水 · 点此编辑' : '排尿 · 点此编辑'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    item.kind === 'intake'
                      ? removeIntake(date, item.id)
                      : removeVoid(date, item.id)
                  }
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {dayInterp && (
        <section className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>日间解读</h3>
            <BandBadge band={dayInterp.band} />
          </div>
          <p className="hint">{dayInterp.plain}</p>
          <div className="range-bar">
            <div className="small">&lt;65% EBC</div>
            <div className="normal">常见范围</div>
            <div className="poly">&gt;130% EBC</div>
          </div>
        </section>
      )}

      {nightInterp && (night.wetDiaperG != null || night.morningVoidMl != null || night.bedwet) && (
        <section className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>夜间简读</h3>
            <BandBadge band={nightInterp.band} />
          </div>
          <p className="hint">{nightInterp.plain}</p>
        </section>
      )}

      <section className="card">
        <h3>记录小提示</h3>
        <p className="hint">日间：连续 3–4 天，每次饮水与排尿都记时间和 ml。</p>
        <p className="hint">夜间：连续 7 晚；尿布湿重 − 干重 = 尿量（1g≈1ml），再加上起夜与晨起第一次尿量。</p>
        <p className="disclaimer">仅供记录与就诊参考，不能代替医生诊断。</p>
        <Link to="/guide" className="btn btn-secondary btn-block">
          查看完整准备说明
        </Link>
      </section>

      {edit && (
        <QuickLogModal
          mode={edit.mode}
          title={
            edit.id
              ? edit.mode === 'intake'
                ? '编辑喝水'
                : '编辑排尿'
              : edit.mode === 'intake'
                ? '记喝水'
                : '记排尿'
          }
          hint={
            edit.mode === 'intake'
              ? '水、奶、汤、果汁都算。尽量写清时间与大约毫升数。'
              : '用量杯最准。没有量杯时，可用常用杯子粗估，并尽量每次方式一致。'
          }
          initial={
            editingItem
              ? {
                  time: editingItem.time,
                  volumeMl: editingItem.volumeMl,
                  leak: editingItem.leak,
                }
              : undefined
          }
          onClose={() => setEdit(null)}
          onSave={({ time, volumeMl, leak }) => {
            if (edit.mode === 'intake') {
              if (edit.id) updateIntake(date, edit.id, { time, volumeMl })
              else addIntake(date, { time, volumeMl })
            } else if (edit.id) {
              updateVoid(date, edit.id, { time, volumeMl, leak: !!leak })
            } else {
              addVoid(date, { time, volumeMl, leak: !!leak })
            }
          }}
        />
      )}
    </div>
  )
}
