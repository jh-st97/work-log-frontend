import { apiFetch } from "./client";
import type { TaskRequest, TaskResponse, TaskStatus, TaskStatusRequest, TaskPriority } from "../types/task";
import type { Page } from "../types/page";

// 업무 목록 조회 조건. 전부 선택 사항 — 안 주면 백엔드가 "보관 안 된 내 업무 전체"로 처리한다.
export interface TaskListParams {
	status?: TaskStatus;
	priority?: TaskPriority;
	projectId?: number;
	systemId?: number;
	tagId?: number;
	keyword?: string;
	page?: number;
	size?: number;
}

// GET /api/tasks : 내 업무 목록(필터·페이징). 백엔드가 페이징으로 응답한다(Page<TaskResponse>).
export function getTasks(params: TaskListParams = {}): Promise<Page<TaskResponse>> {
	const query = new URLSearchParams();
	if (params.status) query.set("status", params.status);
	if (params.priority) query.set("priority", params.priority);
	if (params.projectId !== undefined) query.set("projectId", String(params.projectId));
	if (params.systemId !== undefined) query.set("systemId", String(params.systemId));
	if (params.tagId !== undefined) query.set("tagId", String(params.tagId));
	if (params.keyword) query.set("keyword", params.keyword);
	query.set("page", String(params.page ?? 0));
	query.set("size", String(params.size ?? 20));

	return apiFetch<Page<TaskResponse>>(`/api/tasks?${query.toString()}`);
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
