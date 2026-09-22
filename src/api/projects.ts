import { apiFetch } from "./client";
import type { ProjectRequest, ProjectResponse } from "../types/project";

// GET /api/projects : 내 프로젝트 목록 (보관 제외)
export function getProjects(): Promise<ProjectResponse[]> {
	return apiFetch<ProjectResponse[]>("/api/projects");
}

// POST /api/projects : 프로젝트 등록
export function createProject(request: ProjectRequest): Promise<ProjectResponse> {
	return apiFetch<ProjectResponse>("/api/projects", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// DELETE /api/projects/{id} : 실제로는 보관 처리
export function archiveProject(id: number): Promise<void> {
	return apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" });
}
