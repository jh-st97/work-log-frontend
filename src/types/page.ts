// 백엔드가 페이징 목록을 줄 때 쓰는 공통 응답 형태 (Spring Data의 Page<T>).
// 실제 응답엔 필드가 더 있지만, 화면에서 쓰는 것만 담는다.
export interface Page<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
}
