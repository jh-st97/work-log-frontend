import { apiFetch } from "./client";
import type {
	LoginRequest,
	LoginResponse,
	MemberResponse,
	SignupRequest,
	SignupResponse,
} from "../types/auth";

// 회원가입
export function signup(request: SignupRequest): Promise<SignupResponse> {
	return apiFetch<SignupResponse>("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// 로그인. 성공하면 토큰이 담긴 LoginResponse를 돌려준다.
// 토큰을 localStorage에 저장하는 것은 이 함수를 부르는 쪽(화면)에서 한다.
export function login(request: LoginRequest): Promise<LoginResponse> {
	return apiFetch<LoginResponse>("/api/auth/login", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// 내 정보 조회. apiFetch가 localStorage의 토큰을 자동으로 헤더에 붙여준다.
export function getMe(): Promise<MemberResponse> {
	return apiFetch<MemberResponse>("/api/members/me");
}
