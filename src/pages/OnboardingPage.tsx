import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useDiary } from '../context/DiaryContext'
import type { Profile } from '../types'

export function OnboardingPage() {
  const { profile, setProfile } = useDiary()
  const navigate = useNavigate()
  const [childName, setChildName] = useState(profile?.childName ?? '')
  const [ageYears, setAgeYears] = useState(String(profile?.ageYears ?? 8))
  const [parentName, setParentName] = useState(profile?.parentName ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [step, setStep] = useState(0)

  if (profile?.guided) {
    return <Navigate to="/" replace />
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const age = Number(ageYears)
    if (!childName.trim() || !age || age < 1 || age > 18) {
      alert('请填写孩子姓名，以及 1–18 岁的年龄（用于估算膀胱容量）')
      return
    }
    const next: Profile = {
      childName: childName.trim(),
      ageYears: Math.round(age),
      parentName: parentName.trim(),
      phone: phone.trim(),
      guided: true,
      daytimeTargetDays: 4,
      nighttimeTargetNights: 7,
    }
    setProfile(next)
    navigate('/')
  }

  return (
    <div>
      <header className="brand">
        <h1>排尿日记</h1>
        <p className="slogan">Dry nights mean good mornings</p>
        <div className="hero-art" aria-hidden />
      </header>

      {step === 0 && (
        <section className="card">
          <h2>给家长的说明</h2>
          <p className="hint">
            这份日记参考儿童泌尿专科常用的<strong>日间日记 + 夜间日记</strong>做法，帮助医生了解孩子膀胱功能和夜间尿量。
          </p>
          <p className="hint">
            一般需要：<strong>连续 3–4 天日间记录</strong>，以及<strong>连续 7 个夜晚</strong>的夜间记录。
          </p>
          <p className="hint">
            请准备：带刻度的量杯、厨房秤、夜间尿布。称重时记住 <strong>1g ≈ 1ml</strong>。
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setStep(1)}>
            下一步：填写孩子信息
          </button>
        </section>
      )}

      {step === 1 && (
        <form className="card stack" onSubmit={submit}>
          <h2>孩子档案</h2>
          <p className="hint">年龄用于计算预期膀胱容量：EBC = (年龄 + 1) × 30 ml。</p>
          <label className="label">
            儿童姓名
            <input value={childName} onChange={(e) => setChildName(e.target.value)} required />
          </label>
          <label className="label">
            年龄（岁）
            <input
              inputMode="numeric"
              value={ageYears}
              onChange={(e) => setAgeYears(e.target.value.replace(/[^\d]/g, ''))}
              required
            />
          </label>
          <label className="label">
            家长姓名（可选）
            <input value={parentName} onChange={(e) => setParentName(e.target.value)} />
          </label>
          <label className="label">
            联系电话（可选）
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary btn-block">
            开始记录
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={() => setStep(0)}>
            返回说明
          </button>
        </form>
      )}
    </div>
  )
}
