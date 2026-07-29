import { useState, type FormEvent } from 'react'
import { useDiary } from '../context/DiaryContext'
import type { GithubSettings } from '../types'

export function SettingsPage() {
  const {
    profile,
    setProfile,
    data,
    setGithub,
    pushToGithub,
    pullFromGithub,
    downloadBackup,
    resetAll,
  } = useDiary()
  const [owner, setOwner] = useState(data.github?.owner ?? '')
  const [repo, setRepo] = useState(data.github?.repo ?? '')
  const [token, setToken] = useState(data.github?.token ?? '')
  const [branch, setBranch] = useState(data.github?.branch ?? 'main')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  if (!profile) return null

  function saveGithub(e: FormEvent) {
    e.preventDefault()
    const g: GithubSettings = {
      owner: owner.trim(),
      repo: repo.trim(),
      token: token.trim(),
      branch: branch.trim() || 'main',
    }
    setGithub(g)
    setMsg('GitHub 设置已保存（仅存在本机浏览器）')
  }

  async function run(action: 'push' | 'pull') {
    setBusy(true)
    setMsg('')
    try {
      if (action === 'push') await pushToGithub()
      else await pullFromGithub()
      setMsg(action === 'push' ? '已上传到 GitHub' : '已从 GitHub 恢复')
    } catch (err) {
      setMsg(err instanceof Error ? err.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <header className="brand">
        <h1>设置</h1>
        <p className="slogan">档案 · 备份 · 高级</p>
      </header>

      <section className="card stack">
        <h2>孩子档案</h2>
        <label className="label">
          姓名
          <input
            value={profile.childName}
            onChange={(e) => setProfile({ ...profile, childName: e.target.value })}
          />
        </label>
        <label className="label">
          年龄（岁）
          <input
            inputMode="numeric"
            value={profile.ageYears}
            onChange={(e) =>
              setProfile({
                ...profile,
                ageYears: Math.max(1, Math.min(18, Number(e.target.value) || 1)),
              })
            }
          />
        </label>
        <label className="label">
          日间目标天数
          <input
            inputMode="numeric"
            value={profile.daytimeTargetDays}
            onChange={(e) =>
              setProfile({
                ...profile,
                daytimeTargetDays: Math.max(3, Math.min(7, Number(e.target.value) || 4)),
              })
            }
          />
        </label>
        <label className="label">
          夜间目标晚数
          <input
            inputMode="numeric"
            value={profile.nighttimeTargetNights}
            onChange={(e) =>
              setProfile({
                ...profile,
                nighttimeTargetNights: Math.max(3, Math.min(14, Number(e.target.value) || 7)),
              })
            }
          />
        </label>
      </section>

      <section className="card stack">
        <h2>本机备份</h2>
        <p className="hint">日记默认保存在这个手机/电脑的浏览器里。可先下载 JSON 备份。</p>
        <button type="button" className="btn btn-secondary btn-block" onClick={downloadBackup}>
          下载 JSON 备份
        </button>
      </section>

      <form className="card stack" onSubmit={saveGithub}>
        <h2>GitHub 私有仓备份（高级）</h2>
        <p className="hint">
          建议使用<strong>私有仓库</strong>。Token 只保存在本机，请勿截图或发给别人。
          需要对该仓库有 contents 读写权限。
        </p>
        <label className="label">
          用户名 / 组织
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="your-name" />
        </label>
        <label className="label">
          仓库名
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="voiding-diary-data"
          />
        </label>
        <label className="label">
          分支
          <input value={branch} onChange={(e) => setBranch(e.target.value)} />
        </label>
        <label className="label">
          Personal Access Token
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            autoComplete="off"
          />
        </label>
        <button type="submit" className="btn btn-secondary btn-block">
          保存 GitHub 设置
        </button>
        <div className="row">
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={busy}
            onClick={() => run('push')}
          >
            上传备份
          </button>
          <button
            type="button"
            className="btn btn-dawn"
            style={{ flex: 1 }}
            disabled={busy}
            onClick={() => run('pull')}
          >
            拉取恢复
          </button>
        </div>
        {msg && <p className="hint">{msg}</p>}
      </form>

      <section className="card">
        <h2>危险操作</h2>
        <button type="button" className="btn btn-ghost btn-block" onClick={resetAll}>
          清空本机全部数据
        </button>
      </section>
    </div>
  )
}
