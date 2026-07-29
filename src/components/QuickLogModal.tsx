import { useMemo, useState } from 'react'
import { nowTime } from '../lib/dates'

const VOLUME_PRESETS = [50, 100, 150, 200, 250, 300]

type Initial = {
  time?: string
  volumeMl?: number
  leak?: boolean
}

type Props = {
  title: string
  hint: string
  mode: 'intake' | 'void'
  initial?: Initial
  onClose: () => void
  onSave: (data: { time: string; volumeMl: number; leak?: boolean }) => void
}

export function QuickLogModal({ title, hint, mode, initial, onClose, onSave }: Props) {
  const initialVolume = initial?.volumeMl ?? 100
  const presetMatch = VOLUME_PRESETS.includes(initialVolume)
  const [time, setTime] = useState(initial?.time ?? nowTime())
  const [volume, setVolume] = useState(presetMatch ? initialVolume : 100)
  const [custom, setCustom] = useState(presetMatch || initial?.volumeMl == null ? '' : String(initialVolume))
  const [leak, setLeak] = useState(initial?.leak ?? false)

  const volumeMl = useMemo(() => {
    const n = Number(custom)
    if (custom !== '' && !Number.isNaN(n) && n >= 0) return Math.round(n)
    return volume
  }, [custom, volume])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="hint">{hint}</p>
        <div className="stack">
          <label className="label">
            时间
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <div>
            <div className="hint" style={{ marginBottom: 8 }}>
              快捷选择尿量 / 饮水量（ml）
            </div>
            <div className="chips">
              {VOLUME_PRESETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`chip ${custom === '' && volume === v ? 'active' : ''}`}
                  onClick={() => {
                    setVolume(v)
                    setCustom('')
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <label className="label">
            自定义 ml（可选）
            <input
              inputMode="numeric"
              placeholder="例如 180"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ''))}
            />
          </label>
          {mode === 'void' && (
            <label className="label" style={{ alignItems: 'start' }}>
              这次之前 / 之间有没有漏尿？
              <div className="chips">
                <button
                  type="button"
                  className={`chip ${!leak ? 'active' : ''}`}
                  onClick={() => setLeak(false)}
                >
                  无
                </button>
                <button
                  type="button"
                  className={`chip ${leak ? 'active' : ''}`}
                  onClick={() => setLeak(true)}
                >
                  有
                </button>
              </div>
              <span className="hint" style={{ margin: 0 }}>
                只要湿了裤子或没到厕所就漏出来，就算「有」。
              </span>
            </label>
          )}
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              onSave({ time, volumeMl, leak: mode === 'void' ? leak : undefined })
              onClose()
            }}
          >
            保存 · {volumeMl} ml
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
