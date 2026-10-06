import { apiFetch } from "./client";
import type { TagRequest, TagResponse } from "../types/tag";
import type { Page } from "../types/page";

// GET /api/tags : 내 태그 목록. 백엔드는 페이징으로 응답하지만, 체크박스·드롭다운에 전체가 필요해서
// 넉넉하게(1000개) 받아 목록만 돌려준다.
export async function getTags(): Promise<TagResponse[]> {
	const page = await apiFetch<Page<TagResponse>>("/api/tags?size=1000");
	return page.content;
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
