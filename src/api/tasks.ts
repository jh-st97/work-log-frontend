import { apiFetch } from "./client";
import type { TaskRequest, TaskResponse, TaskStatusRequest } from "../types/task";

// GET /api/tasks : 내 업무 목록
export function getTasks(): Promise<TaskResponse[]> {
	return apiFetch<TaskResponse[]>("/api/tasks");
}

// GET /api/tasks/{id} : 업무 상세
export function getTask(id: number): Promise<TaskResponse> {
	return apiFetch<TaskResponse>(`/api/tasks/${id}`);
}

// POST /api/tasks : 업무 등록
export function createTask(request: TaskRequest): Promise<TaskResponse> {
	return apiFetch<TaskResponse>("/api/tasks", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// PATCH /api/tasks/{id} : 업무 수정 (상태는 여기서 안 바꿈)
export function updateTask(id: number, request: TaskRequest): Promise<TaskResponse> {
	return apiFetch<TaskResponse>(`/api/tasks/${id}`, {
		method: "PATCH",
		body: JSON.stringify(request),
	});
}

// PATCH /api/tasks/{id}/status : 상태만 따로 변경
export function changeTaskStatus(id: number, request: TaskStatusRequest): Promise<TaskResponse> {
	return apiFetch<TaskResponse>(`/api/tasks/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify(request),
	});
}

// DELETE /api/tasks/{id} : 실제로는 보관 처리
export function archiveTask(id: number): Promise<void> {
	return apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" });
}
