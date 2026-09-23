import type { TagResponse } from "./tag";
import type { WorkSystemResponse } from "./workSystem";

// 백엔드의 TaskStatus, TaskPriority enum과 값이 똑같아야 한다
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

// 백엔드의 TaskRequest(record)와 대응
export interface TaskRequest {
	title: string;
	description: string | null;
	priority: TaskPriority | null;
	dueDate: string | null;
	projectId: number;
	tagIds: number[];
	systemIds: number[];
}

// 백엔드의 TaskStatusRequest(record)와 대응
export interface TaskStatusRequest {
	status: TaskStatus;
}

// 백엔드의 TaskResponse(record)와 대응
export interface TaskResponse {
	id: number;
	projectId: number;
	title: string;
	description: string | null;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: string | null;
	completedAt: string | null;
	// 태그·업무 시스템은 백엔드에서 이미 만든 타입을 그대로 재사용
	tags: TagResponse[];
	systems: WorkSystemResponse[];
}
