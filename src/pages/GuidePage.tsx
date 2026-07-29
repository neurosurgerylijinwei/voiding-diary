import { Link } from 'react-router-dom'

export function GuidePage() {
  return (
    <div>
      <header className="brand">
        <h1>怎么记</h1>
        <p className="slogan">准备工具 · 日间 · 夜间</p>
      </header>

      <section className="card">
        <h2>需要准备什么</h2>
        <p className="hint">
          <strong>量杯</strong>：日间每次排尿、饮水尽量用量杯量到 ml。
        </p>
        <p className="hint">
          <strong>尿布 + 厨房秤</strong>：夜间穿尿布；穿前称干重，起床后称湿重。
        </p>
        <p className="hint">
          <strong>换算</strong>：湿重(g) − 干重(g) = 尿量(ml)，因为 <strong>1g ≈ 1ml</strong>。
        </p>
      </section>

      <section className="card">
        <h2>日间日记（约 3–4 天）</h2>
        <p className="hint">从起床记到睡觉：</p>
        <p className="hint">1. 每次喝了什么、多少 ml（水/奶/汤/果汁都算）</p>
        <p className="hint">2. 每次排尿时间与尿量</p>
        <p className="hint">3. 有没有漏尿（湿裤子或来不及）</p>
        <p className="hint">
          系统会自动找出白天较大的一次尿量（MVV），并与年龄估算的膀胱容量比较。
        </p>
      </section>

      <section className="card">
        <h2>夜间日记（连续 7 晚）</h2>
        <p className="hint">每晚记录：睡觉/起床时间、是否尿床、尿布重量、起夜尿量、晨起第一次尿量、是否大便。</p>
        <p className="hint">
          夜间总尿量 TVV = 尿布尿量 + 起夜尿量 + 晨起第一次尿量。若 TVV 高于年龄参考上限（约 130% EBC），可能提示夜间尿量偏多。
        </p>
      </section>

      <section className="card">
        <h2>怎么读结果</h2>
        <p className="hint">EBC（估算膀胱容量）= (年龄 + 1) × 30 ml</p>
        <p className="hint">白天最大尿量 MVV &lt; 65% EBC → 容量可能偏小</p>
        <p className="hint">夜间总尿量 TVV &gt; 130% EBC → 夜间尿量可能偏多</p>
        <p className="disclaimer">
          页面上的白话解读是为了方便家长理解，不能代替医生诊断。就诊时请出示完整日记。
        </p>
      </section>

      <Link to="/" className="btn btn-primary btn-block">
        返回今日
      </Link>
    </div>
  )
}
