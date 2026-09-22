import { apiFetch } from "./client";
import type { TagRequest, TagResponse } from "../types/tag";

// GET /api/tags : 내 태그 목록
export function getTags(): Promise<TagResponse[]> {
	return apiFetch<TagResponse[]>("/api/tags");
}

// POST /api/tags : 태그 등록
export function createTag(request: TagRequest): Promise<TagResponse> {
	return apiFetch<TagResponse>("/api/tags", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

// PATCH /api/tags/{id} : 태그 이름 수정
export function updateTag(id: number, request: TagRequest): Promise<TagResponse> {
	return apiFetch<TagResponse>(`/api/tags/${id}`, {
		method: "PATCH",
		body: JSON.stringify(request),
	});
}

// DELETE /api/tags/{id} : 태그는 보관이 아니라 진짜로 삭제된다
export function deleteTag(id: number): Promise<void> {
	return apiFetch<void>(`/api/tags/${id}`, { method: "DELETE" });
}
