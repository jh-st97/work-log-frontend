import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { saveToken } from "../auth/token";
import { ApiError } from "../api/client";

export function LoginPage() {
	// useState: 화면이 다시 그려져도 값이 유지되는 "상태"를 만든다.
	// email이 바뀌면 setEmail을 부르고, 그러면 화면이 자동으로 다시 그려진다.
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	// 로그인 실패 메시지를 보여줄 자리. 평소엔 null(안 보임)
	const [error, setError] = useState<string | null>(null);
	// 요청 중일 때 버튼을 비활성화하기 위한 상태
	const [loading, setLoading] = useState(false);

	// 페이지 이동을 위한 함수. 로그인 성공하면 이걸로 다른 화면으로 보낸다.
	const navigate = useNavigate();

	// 폼(로그인 버튼)을 제출했을 때 실행되는 함수
	async function handleSubmit(e: FormEvent) {
		e.preventDefault(); // 브라우저 기본 동작(새로고침)을 막는다
		setError(null);
		setLoading(true);

		try {
			const response = await login({ email, password });
			saveToken(response.accessToken);
			navigate("/"); // 로그인 성공하면 홈 화면으로 이동
		} catch (e) {
			// api/client.ts에서 던진 ApiError면 백엔드 메시지를 그대로 보여준다
			if (e instanceof ApiError) {
				setError(e.message);
			} else {
				setError("로그인 중 문제가 발생했습니다.");
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="page-center">
			<div className="card">
				<h1>로그인</h1>

				<form onSubmit={handleSubmit}>
					<div className="field">
						<label htmlFor="email">이메일</label>
						{/* value={email}: 항상 email 상태값을 보여준다 (제어 컴포넌트)
						    onChange: 글자를 입력할 때마다 email 상태를 최신값으로 갱신한다 */}
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="field">
						<label htmlFor="password">비밀번호</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					{/* error가 있을 때만 이 줄이 보인다 */}
					{error && <p className="error-text">{error}</p>}

					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? "로그인 중..." : "로그인"}
					</button>
				</form>

				<p className="auth-switch">
					계정이 없으신가요? <Link to="/signup">회원가입</Link>
				</p>
			</div>
		</div>
	);
}
