import { apiFetch } from "./client";
import type { TaskResultRequest, TaskResultResponse } from "../types/taskResult";

// GET /api/tasks/{taskId}/results : 이 업무에 달린 성과 항목 전체 조회
export function getTaskResults(taskId: number): Promise<TaskResultResponse[]> {
	return apiFetch<TaskResultResponse[]>(`/api/tasks/${taskId}/results`);
}

// POST /api/tasks/{taskId}/results : 성과 항목 추가
export function createTaskResult(taskId: number, request: TaskResultRequest): Promise<TaskResultResponse> {
	return apiFetch<TaskResultResponse>(`/api/tasks/${taskId}/results`, {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// PATCH /api/tasks/{taskId}/results/{resultId} : 성과 항목 수정
export function updateTaskResult(
	taskId: number,
	resultId: number,
	request: TaskResultRequest,
): Promise<TaskResultResponse> {
	return apiFetch<TaskResultResponse>(`/api/tasks/${taskId}/results/${resultId}`, {
		method: "PATCH",
		body: JSON.stringify(request),
	});
}

// DELETE /api/tasks/{taskId}/results/{resultId} : 성과 항목 삭제
export function deleteTaskResult(taskId: number, resultId: number): Promise<void> {
	return apiFetch<void>(`/api/tasks/${taskId}/results/${resultId}`, { method: "DELETE" });
}
