import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api/auth";
import { clearToken } from "../auth/token";
import type { MemberResponse } from "../types/auth";

// 로그인이 실제로 잘 되는지 확인하는 용도의 임시 홈 화면.
// GET /api/members/me를 호출해서, 토큰으로 내 정보를 제대로 받아오는지 보여준다.
// 나중에 프로젝트 목록 등 진짜 홈 화면으로 바꾸면 된다.
export function HomePage() {
	const [member, setMember] = useState<MemberResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	// useEffect: 화면이 처음 그려진 직후에 딱 한 번 실행된다 (두 번째 인자가 빈 배열 [] 이라서).
	// "화면을 열자마자 내 정보를 가져와라"는 뜻.
	useEffect(() => {
		getMe()
			.then(setMember)
			.catch(() => setError("내 정보를 불러오지 못했습니다."));
	}, []);

	function handleLogout() {
		clearToken();
		navigate("/login");
	}

	return (
		<div className="page-center">
			<div className="card" style={{ textAlign: "center" }}>
				<h1>홈</h1>

				{error && <p className="error-text">{error}</p>}

				{member ? (
					<>
						<div
							style={{
								width: 56,
								height: 56,
								margin: "0 auto 16px",
								borderRadius: "50%",
								background: "var(--accent-bg)",
								color: "var(--accent)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 22,
								fontWeight: 700,
							}}
						>
							{member.nickname.charAt(0).toUpperCase()}
						</div>
						<p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>
							{member.nickname}님, 안녕하세요
						</p>
						<p style={{ fontSize: 14, color: "var(--text)", margin: "0 0 24px" }}>
							{member.email}
						</p>
					</>
				) : (
					!error && <p style={{ margin: "24px 0" }}>불러오는 중...</p>
				)}

				<button className="btn-secondary" onClick={handleLogout}>
					로그아웃
				</button>
			</div>
		</div>
	);
}
