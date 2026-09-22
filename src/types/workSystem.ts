// 백엔드의 WorkSystemRequest(record)와 대응
export interface WorkSystemRequest {
	name: string;
	description: string | null;
}

// 백엔드의 WorkSystemResponse(record)와 대응
export interface WorkSystemResponse {
	id: number;
	name: string;
	description: string | null;
}
