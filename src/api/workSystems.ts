import { apiFetch } from "./client";
import type { WorkSystemRequest, WorkSystemResponse } from "../types/workSystem";

// GET /api/systems : 내 업무 시스템 목록
export function getWorkSystems(): Promise<WorkSystemResponse[]> {
	return apiFetch<WorkSystemResponse[]>("/api/systems");
}

// POST /api/systems : 업무 시스템 등록
export function createWorkSystem(request: WorkSystemRequest): Promise<WorkSystemResponse> {
	return apiFetch<WorkSystemResponse>("/api/systems", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// PATCH /api/systems/{id} : 업무 시스템 수정
export function updateWorkSystem(id: number, request: WorkSystemRequest): Promise<WorkSystemResponse> {
	return apiFetch<WorkSystemResponse>(`/api/systems/${id}`, {
		method: "PATCH",
		body: JSON.stringify(request),
	});
}

// DELETE /api/systems/{id} : 태그처럼 보관이 아니라 진짜 삭제
export function deleteWorkSystem(id: number): Promise<void> {
	return apiFetch<void>(`/api/systems/${id}`, { method: "DELETE" });
}
