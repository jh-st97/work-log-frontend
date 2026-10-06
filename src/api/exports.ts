import { apiFetch } from "./client";

// GET /api/exports/resume?taskIds=1&taskIds=2 : 고른 업무들을 이력서용 마크다운으로
export function getResumeMarkdown(taskIds: number[]): Promise<{ markdown: string }> {
	const query = new URLSearchParams();
	// 같은 이름(taskIds)을 여러 번 붙이면 백엔드가 목록으로 받는다
	taskIds.forEach((id) => query.append("taskIds", String(id)));

	return apiFetch<{ markdown: string }>(`/api/exports/resume?${query.toString()}`);
}
