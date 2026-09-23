// 성과 항목 등록·수정 요청. beforeValue는 없어도 된다(수치가 아닌 성과도 담을 수 있어서).
export interface TaskResultRequest {
	metricName: string;
	beforeValue: string | null;
	afterValue: string;
}

// 성과 항목 응답
export interface TaskResultResponse {
	id: number;
	metricName: string;
	beforeValue: string | null;
	afterValue: string;
}
