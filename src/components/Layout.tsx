import { Outlet, useNavigate } from "react-router-dom";
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
				<span className="brand">work-log</span>
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
