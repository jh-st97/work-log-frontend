import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import { ApiError } from "../api/client";

export function SignupPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [nickname, setNickname] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	// 가입에 성공했는지 여부. 성공하면 폼 대신 안내 메시지를 보여준다.
	const [done, setDone] = useState(false);

	const navigate = useNavigate();

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			await signup({ email, password, nickname });
			// 회원가입 API는 토큰을 안 주기 때문에(가입만 하고 로그인은 따로),
			// 바로 로그인시키지 않고 "가입됐다"는 안내만 보여준다.
			setDone(true);
		} catch (e) {
			if (e instanceof ApiError) {
				setError(e.message);
			} else {
				setError("회원가입 중 문제가 발생했습니다.");
			}
		} finally {
			setLoading(false);
		}
	}

	// 가입 성공 후에는 폼 대신 완료 화면을 보여준다
	if (done) {
		return (
			<div className="page-center">
				<div className="card" style={{ textAlign: "center" }}>
					<h1>가입 완료</h1>
					<p style={{ margin: "0 0 24px", color: "var(--text)" }}>
						회원가입이 완료됐습니다. 로그인해 주세요.
					</p>
					<button className="btn-primary" onClick={() => navigate("/login")}>
						로그인하러 가기
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="page-center">
			<div className="card">
				<h1>회원가입</h1>

				<form onSubmit={handleSubmit}>
					<div className="field">
						<label htmlFor="email">이메일</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="field">
						<label htmlFor="nickname">닉네임</label>
						<input
							id="nickname"
							type="text"
							value={nickname}
							onChange={(e) => setNickname(e.target.value)}
							maxLength={30}
							required
						/>
					</div>

					<div className="field">
						<label htmlFor="password">비밀번호</label>
						{/* 백엔드 검증 규칙(8~72자)과 맞춰 미리 안내한다.
						    실제 검증은 백엔드가 하고, 여기 minLength/maxLength는 사용자 편의용이다. */}
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							minLength={8}
							maxLength={72}
							required
						/>
					</div>

					{error && <p className="error-text">{error}</p>}

					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? "가입 중..." : "회원가입"}
					</button>
				</form>

				<p className="auth-switch">
					이미 계정이 있으신가요? <Link to="/login">로그인</Link>
				</p>
			</div>
		</div>
	);
}
