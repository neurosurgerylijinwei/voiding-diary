import { NavLink, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="app-shell">
      <Outlet />
      <nav className="nav no-print">
        <NavLink to="/" end>
          今日
        </NavLink>
        <NavLink to="/progress">
          进度
        </NavLink>
        <NavLink to="/summary">
          解读
        </NavLink>
        <NavLink to="/settings">
          设置
        </NavLink>
      </nav>
    </div>
  )
}
