// 백엔드의 TagRequest(record)와 대응
export interface TagRequest {
	name: string;
}

// 백엔드의 TagResponse(record)와 대응
export interface TagResponse {
	id: number;
	name: string;
}
