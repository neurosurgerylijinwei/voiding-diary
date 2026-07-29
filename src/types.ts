export type Profile = {
  childName: string
  ageYears: number
  parentName: string
  phone: string
  guided: boolean
  daytimeTargetDays: number
  nighttimeTargetNights: number
}

export type IntakeEntry = {
  id: string
  time: string // HH:mm
  volumeMl: number
  note?: string
}

export type VoidEntry = {
  id: string
  time: string
  volumeMl: number
  leak: boolean
  note?: string
}

export type DayRecord = {
  date: string // YYYY-MM-DD
  intakes: IntakeEntry[]
  voids: VoidEntry[]
}

export type NightRecord = {
  date: string // night of this calendar date (sleep date)
  sleepTime: string
  wakeTime: string
  bedwet: boolean
  nightVoids: { id: string; time: string; volumeMl: number }[]
  dryDiaperG: number | null
  wetDiaperG: number | null
  morningVoidMl: number | null
  bowel: boolean
  note?: string
}

export type GithubSettings = {
  owner: string
  repo: string
  token: string
  branch: string
}

export type AppData = {
  profile: Profile | null
  days: Record<string, DayRecord>
  nights: Record<string, NightRecord>
  github: GithubSettings | null
  daytimeSessionStart: string | null
  nighttimeSessionStart: string | null
}

export type CapacityBand = 'small' | 'normal' | 'large'
export type NightBand = 'normal' | 'polyuria'

export type DayInterpretation = {
  date: string
  ebc: number
  mvv: number | null
  mvvThreshold: number
  band: CapacityBand | 'insufficient'
  plain: string
}

export type NightInterpretation = {
  date: string
  ebc: number
  tvv: number | null
  tvvThreshold: number
  band: NightBand | 'insufficient'
  plain: string
}
