import { apiFetch } from "./client";
import type { WorkSystemRequest, WorkSystemResponse } from "../types/workSystem";
import type { Page } from "../types/page";

// GET /api/systems : 내 업무 시스템 목록. 백엔드는 페이징으로 응답하지만, 체크박스·드롭다운에 전체가
// 필요해서 넉넉하게(1000개) 받아 목록만 돌려준다.
export async function getWorkSystems(): Promise<WorkSystemResponse[]> {
	const page = await apiFetch<Page<WorkSystemResponse>>("/api/systems?size=1000");
	return page.content;
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
