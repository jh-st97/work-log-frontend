import type { TaskLogResponse } from "./taskLog";

// 하루 회고 저장용. summary만 보낸다(날짜는 URL 경로에 있음).
export interface DailyLogRequest {
	summary: string | null;
}

export interface DailyLogResponse {
	id: number;
	logDate: string;
	summary: string | null;
	// 기간 목록 조회에서는 빈 배열로 온다. 하루 상세 조회·저장에서만 채워져서 온다.
	taskLogs: TaskLogResponse[];
}
