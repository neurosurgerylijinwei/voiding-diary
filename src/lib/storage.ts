import type { AppData, GithubSettings, Profile } from '../types'

const KEY = 'voiding-diary-v1'

const defaultProfileBits = {
  guided: false,
  daytimeTargetDays: 4,
  nighttimeTargetNights: 7,
}

export function emptyData(): AppData {
  return {
    profile: null,
    days: {},
    nights: {},
    github: null,
    daytimeSessionStart: null,
    nighttimeSessionStart: null,
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as AppData
    return {
      ...emptyData(),
      ...parsed,
      days: parsed.days ?? {},
      nights: parsed.nights ?? {},
    }
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export async function githubPutFile(
  settings: GithubSettings,
  path: string,
  content: string,
  message: string,
): Promise<void> {
  const { owner, repo, token, branch } = settings
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  let sha: string | undefined
  const getRes = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (getRes.ok) {
    const body = (await getRes.json()) as { sha?: string }
    sha = body.sha
  }

  const putRes = await fetch(api, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch,
      sha,
    }),
  })
  if (!putRes.ok) {
    const err = await putRes.text()
    throw new Error(`GitHub 上传失败：${putRes.status} ${err}`)
  }
}

export async function githubGetFile(
  settings: GithubSettings,
  path: string,
): Promise<string | null> {
  const { owner, repo, token, branch } = settings
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`
  const res = await fetch(api, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`GitHub 读取失败：${res.status}`)
  }
  const body = (await res.json()) as { content?: string; encoding?: string }
  if (!body.content) return null
  const bin = atob(body.content.replace(/\n/g, ''))
  return decodeURIComponent(escape(bin))
}

export function ensureProfileDefaults(p: Profile): Profile {
  return { ...defaultProfileBits, ...p }
}
