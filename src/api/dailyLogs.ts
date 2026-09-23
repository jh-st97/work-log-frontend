import { apiFetch } from "./client";
import type { DailyLogRequest, DailyLogResponse } from "../types/dailyLog";

// GET /api/daily-logs/{date} : 하루 일지 조회 (회고 + 그날의 진행 메모)
export function getDailyLog(date: string): Promise<DailyLogResponse> {
	return apiFetch<DailyLogResponse>(`/api/daily-logs/${date}`);
}

// PUT /api/daily-logs/{date} : 하루 회고 저장 (없으면 생성, 있으면 수정)
export function saveDailyLog(date: string, request: DailyLogRequest): Promise<DailyLogResponse> {
	return apiFetch<DailyLogResponse>(`/api/daily-logs/${date}`, {
		method: "PUT",
		body: JSON.stringify(request),
	});
}
