import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { clearToken } from "../auth/token";

// 로그인 후 보이는 모든 화면의 공통 틀.
// 위에는 상단바(로고 + 로그아웃), 아래에는 <Outlet />이 있는데
// 여기에 App.tsx에서 지정한 실제 화면(프로젝트 목록 등)이 끼워진다.
export function Layout() {
	const navigate = useNavigate();

	function handleLogout() {
		clearToken();
		navigate("/login");
	}

	return (
		<div>
			<header className="app-header">
				<div style={{ display: "flex", alignItems: "center", gap: 28 }}>
					<span className="brand">work-log</span>
					{/* NavLink는 Link와 같지만, 지금 보고 있는 경로와 일치하면 "active" 클래스가 자동으로 붙는다 */}
					<nav style={{ display: "flex", gap: 18 }}>
						<NavLink to="/" end className="nav-link">
							프로젝트
						</NavLink>
						<NavLink to="/tags" className="nav-link">
							태그
						</NavLink>
						<NavLink to="/systems" className="nav-link">
							업무 시스템
						</NavLink>
					</nav>
				</div>
				<button className="btn-secondary" onClick={handleLogout}>
					로그아웃
				</button>
			</header>

			<main>
				<Outlet />
			</main>
		</div>
	);
}
