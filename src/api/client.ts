// 백엔드 서버 주소. 나중에 배포하게 되면 이 값만 바꾸면 된다.
const BASE_URL = "http://localhost:8080";

// 백엔드가 에러일 때 보내주는 { code, message } 형식을 그대로 담는 에러 객체.
// 화면에서 catch (e) { if (e instanceof ApiError) ... } 형태로 잡아서 쓴다.
export class ApiError extends Error {
	constructor(public status: number, public code: string, message: string) {
		super(message);
	}
}

// 모든 API 요청이 거쳐가는 공통 함수.
// - 주소를 자동으로 붙여주고
// - 로그인했으면 토큰 헤더를 자동으로 붙여주고
// - 에러 응답이면 ApiError를 던져준다
// <T>는 "이 함수가 돌려주는 데이터의 타입"을 호출하는 쪽에서 정해서 쓰는 것 (제네릭)
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	// localStorage에 저장해 둔 토큰을 꺼낸다 (없으면 null)
	const token = localStorage.getItem("accessToken");

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		// 토큰이 있을 때만 Authorization 헤더를 추가한다
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

	// 상태 코드가 200번대가 아니면 (400, 401, 404, 409 등) 에러로 처리
	if (!response.ok) {
		// 응답 본문을 JSON으로 읽어보고, 실패하면 기본 메시지를 쓴다
		const body = await response
			.json()
			.catch(() => ({ code: "UNKNOWN", message: "알 수 없는 오류가 발생했습니다." }));
		throw new ApiError(response.status, body.code, body.message);
	}

	// 삭제 API처럼 204(No Content)는 응답 본문이 없다.
	// 이때 response.json()을 부르면 에러가 나므로 따로 처리한다.
	if (response.status === 204) {
		return undefined as T;
	}

	return response.json();
}
