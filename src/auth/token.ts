// localStorage에 토큰을 저장/조회/삭제하는 곳을 한 군데로 모아둔 파일.
// 나중에 저장 방식(예: 쿠키)이 바뀌어도 이 파일만 고치면 된다.

const TOKEN_KEY = "accessToken";

export function saveToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
	return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
	localStorage.removeItem(TOKEN_KEY);
}

// 토큰이 있으면(=로그인한 상태로 간주) true
export function isLoggedIn(): boolean {
	return getToken() !== null;
}
