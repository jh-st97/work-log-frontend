// 진행 메모 등록용. 어떤 업무의 메모인지 taskId로 지정한다.
export interface TaskLogRequest {
	taskId: number;
	content: string;
	spentMinutes: number | null;
}

// 진행 메모 수정용. 업무는 등록 후 바꿀 수 없어서 taskId가 없다.
export interface TaskLogUpdateRequest {
	content: string;
	spentMinutes: number | null;
}

export interface TaskLogResponse {
	id: number;
	taskId: number;
	taskTitle: string;
	logDate: string;
	content: string;
	spentMinutes: number | null;
}
