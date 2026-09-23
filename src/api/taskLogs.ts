import { apiFetch } from "./client";
import type { TaskLogRequest, TaskLogResponse, TaskLogUpdateRequest } from "../types/taskLog";

// POST /api/daily-logs/{date}/task-logs : 진행 메모 등록
export function createTaskLog(date: string, request: TaskLogRequest): Promise<TaskLogResponse> {
	return apiFetch<TaskLogResponse>(`/api/daily-logs/${date}/task-logs`, {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// PATCH /api/task-logs/{id} : 진행 메모 수정
export function updateTaskLog(id: number, request: TaskLogUpdateRequest): Promise<TaskLogResponse> {
	return apiFetch<TaskLogResponse>(`/api/task-logs/${id}`, {
		method: "PATCH",
		body: JSON.stringify(request),
	});
}

// DELETE /api/task-logs/{id} : 진행 메모 삭제
export function deleteTaskLog(id: number): Promise<void> {
	return apiFetch<void>(`/api/task-logs/${id}`, { method: "DELETE" });
}
