import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { todayKey, uid } from '../lib/dates'
import {
  emptyData,
  exportJson,
  githubGetFile,
  githubPutFile,
  loadData,
  saveData,
} from '../lib/storage'
import type {
  AppData,
  DayRecord,
  GithubSettings,
  IntakeEntry,
  NightRecord,
  Profile,
  VoidEntry,
} from '../types'

type DiaryContextValue = {
  data: AppData
  profile: Profile | null
  setProfile: (p: Profile) => void
  ensureSessions: () => void
  getDay: (date: string) => DayRecord
  getNight: (date: string) => NightRecord
  addIntake: (date: string, entry: Omit<IntakeEntry, 'id'>) => void
  addVoid: (date: string, entry: Omit<VoidEntry, 'id'>) => void
  removeIntake: (date: string, id: string) => void
  removeVoid: (date: string, id: string) => void
  saveNight: (night: NightRecord) => void
  setGithub: (g: GithubSettings | null) => void
  pushToGithub: () => Promise<void>
  pullFromGithub: () => Promise<void>
  resetAll: () => void
  downloadBackup: () => void
}

const DiaryContext = createContext<DiaryContextValue | null>(null)

function emptyDay(date: string): DayRecord {
  return { date, intakes: [], voids: [] }
}

function emptyNight(date: string): NightRecord {
  return {
    date,
    sleepTime: '21:00',
    wakeTime: '07:00',
    bedwet: false,
    nightVoids: [],
    dryDiaperG: null,
    wetDiaperG: null,
    morningVoidMl: null,
    bowel: false,
  }
}

export function DiaryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  const setProfile = useCallback((p: Profile) => {
    setData((prev) => ({
      ...prev,
      profile: p,
      daytimeSessionStart: prev.daytimeSessionStart ?? todayKey(),
      nighttimeSessionStart: prev.nighttimeSessionStart ?? todayKey(),
    }))
  }, [])

  const ensureSessions = useCallback(() => {
    setData((prev) => {
      if (prev.daytimeSessionStart && prev.nighttimeSessionStart) return prev
      return {
        ...prev,
        daytimeSessionStart: prev.daytimeSessionStart ?? todayKey(),
        nighttimeSessionStart: prev.nighttimeSessionStart ?? todayKey(),
      }
    })
  }, [])

  const getDay = useCallback(
    (date: string) => data.days[date] ?? emptyDay(date),
    [data.days],
  )

  const getNight = useCallback(
    (date: string) => data.nights[date] ?? emptyNight(date),
    [data.nights],
  )

  const patchDay = useCallback((date: string, fn: (d: DayRecord) => DayRecord) => {
    setData((prev) => {
      const current = prev.days[date] ?? emptyDay(date)
      return {
        ...prev,
        days: { ...prev.days, [date]: fn(current) },
      }
    })
  }, [])

  const addIntake = useCallback(
    (date: string, entry: Omit<IntakeEntry, 'id'>) => {
      patchDay(date, (d) => ({
        ...d,
        intakes: [...d.intakes, { ...entry, id: uid() }].sort((a, b) =>
          a.time.localeCompare(b.time),
        ),
      }))
    },
    [patchDay],
  )

  const addVoid = useCallback(
    (date: string, entry: Omit<VoidEntry, 'id'>) => {
      patchDay(date, (d) => ({
        ...d,
        voids: [...d.voids, { ...entry, id: uid() }].sort((a, b) =>
          a.time.localeCompare(b.time),
        ),
      }))
    },
    [patchDay],
  )

  const removeIntake = useCallback(
    (date: string, id: string) => {
      patchDay(date, (d) => ({
        ...d,
        intakes: d.intakes.filter((x) => x.id !== id),
      }))
    },
    [patchDay],
  )

  const removeVoid = useCallback(
    (date: string, id: string) => {
      patchDay(date, (d) => ({
        ...d,
        voids: d.voids.filter((x) => x.id !== id),
      }))
    },
    [patchDay],
  )

  const saveNight = useCallback((night: NightRecord) => {
    setData((prev) => ({
      ...prev,
      nights: { ...prev.nights, [night.date]: night },
    }))
  }, [])

  const setGithub = useCallback((g: GithubSettings | null) => {
    setData((prev) => ({ ...prev, github: g }))
  }, [])

  const pushToGithub = useCallback(async () => {
    if (!data.github?.token || !data.github.owner || !data.github.repo) {
      throw new Error('请先在设置里填写 GitHub 仓库与 Token')
    }
    await githubPutFile(
      data.github,
      'voiding-diary.json',
      exportJson(data),
      `backup diary ${todayKey()}`,
    )
  }, [data])

  const pullFromGithub = useCallback(async () => {
    if (!data.github?.token || !data.github.owner || !data.github.repo) {
      throw new Error('请先在设置里填写 GitHub 仓库与 Token')
    }
    const raw = await githubGetFile(data.github, 'voiding-diary.json')
    if (!raw) throw new Error('仓库中还没有 voiding-diary.json')
    const parsed = JSON.parse(raw) as AppData
    setData({ ...emptyData(), ...parsed })
  }, [data.github])

  const resetAll = useCallback(() => {
    if (!confirm('确定清空本机全部日记数据？此操作不可恢复。')) return
    setData(emptyData())
  }, [])

  const downloadBackup = useCallback(() => {
    const blob = new Blob([exportJson(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voiding-diary-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [data])

  const value = useMemo(
    () => ({
      data,
      profile: data.profile,
      setProfile,
      ensureSessions,
      getDay,
      getNight,
      addIntake,
      addVoid,
      removeIntake,
      removeVoid,
      saveNight,
      setGithub,
      pushToGithub,
      pullFromGithub,
      resetAll,
      downloadBackup,
    }),
    [
      data,
      setProfile,
      ensureSessions,
      getDay,
      getNight,
      addIntake,
      addVoid,
      removeIntake,
      removeVoid,
      saveNight,
      setGithub,
      pushToGithub,
      pullFromGithub,
      resetAll,
      downloadBackup,
    ],
  )

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>
}

export function useDiary() {
  const ctx = useContext(DiaryContext)
  if (!ctx) throw new Error('useDiary must be used within DiaryProvider')
  return ctx
}
