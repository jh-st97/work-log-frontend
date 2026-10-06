import { apiFetch } from "./client";
import type { ProjectRequest, ProjectResponse } from "../types/project";
import type { Page } from "../types/page";

// GET /api/projects : 내 프로젝트 목록. 기본은 보관 안 된 것, archived=true면 보관함(보관한 것만).
// 백엔드는 페이징으로 응답하지만, 업무 화면의 드롭다운처럼 전체가 한꺼번에 필요해서
// 넉넉하게(1000개) 받아 목록만 돌려준다.
export async function getProjects(archived = false): Promise<ProjectResponse[]> {
	const page = await apiFetch<Page<ProjectResponse>>(`/api/projects?size=1000&archived=${archived}`);
	return page.content;
}

// POST /api/projects/{id}/restore : 보관한 프로젝트 복구
export function restoreProject(id: number): Promise<ProjectResponse> {
	return apiFetch<ProjectResponse>(`/api/projects/${id}/restore`, { method: "POST" });
}

// POST /api/projects : 프로젝트 등록
export function createProject(request: ProjectRequest): Promise<ProjectResponse> {
	return apiFetch<ProjectResponse>("/api/projects", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// PATCH /api/projects/{id} : 프로젝트 수정
export function updateProject(id: number, request: ProjectRequest): Promise<ProjectResponse> {
	return apiFetch<ProjectResponse>(`/api/projects/${id}`, {
		method: "PATCH",
		body: JSON.stringify(request),
	});
}

// DELETE /api/projects/{id} : 실제로는 보관 처리
export function archiveProject(id: number): Promise<void> {
	return apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" });
}
