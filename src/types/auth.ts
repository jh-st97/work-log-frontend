// 백엔드의 SignupRequest(record)와 필드가 똑같아야 한다.
export interface SignupRequest {
	email: string;
	password: string;
	nickname: string;
}

// 백엔드의 SignupResponse(record)와 대응. 비밀번호는 당연히 없다.
export interface SignupResponse {
	id: number;
	email: string;
	nickname: string;
}

// 백엔드의 LoginRequest(record)와 대응
export interface LoginRequest {
	email: string;
	password: string;
}

// 백엔드의 LoginResponse(record)와 대응
export interface LoginResponse {
	accessToken: string;
}

// 백엔드의 MemberResponse(record)와 대응 (GET /api/members/me 응답)
export interface MemberResponse {
	id: number;
	email: string;
	nickname: string;
}
