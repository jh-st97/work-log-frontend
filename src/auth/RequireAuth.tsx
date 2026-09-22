import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "./token";

// 로그인이 필요한 화면을 감싸는 용도.
// 토큰이 없으면 화면을 보여주지 않고 /login으로 보내버린다.
// 사용법: <RequireAuth><HomePage /></RequireAuth>
export function RequireAuth({ children }: { children: ReactNode }) {
	if (!isLoggedIn()) {
		// replace: 뒤로 가기를 눌렀을 때 다시 이 보호된 화면으로 안 돌아오게 한다
		return <Navigate to="/login" replace />;
	}

	return children;
}
