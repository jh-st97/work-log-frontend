// 백엔드의 ProjectRequest(record)와 대응
export interface ProjectRequest {
	name: string;
	description: string | null;
	startDate: string | null; // "2026-09-21" 형식
	endDate: string | null;
}

// 백엔드의 ProjectResponse(record)와 대응
export interface ProjectResponse {
	id: number;
	name: string;
	description: string | null;
	startDate: string | null;
	endDate: string | null;
}
