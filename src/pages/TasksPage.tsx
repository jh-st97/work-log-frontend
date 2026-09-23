import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { archiveTask, changeTaskStatus, createTask, getTasks, updateTask } from "../api/tasks";
import { createTaskResult, deleteTaskResult, getTaskResults, updateTaskResult } from "../api/taskResults";
import { getProjects } from "../api/projects";
import { getTags } from "../api/tags";
import { getWorkSystems } from "../api/workSystems";
import type { TaskResponse, TaskPriority, TaskStatus } from "../types/task";
import type { TaskResultResponse } from "../types/taskResult";
import type { ProjectResponse } from "../types/project";
import type { TagResponse } from "../types/tag";
import type { WorkSystemResponse } from "../types/workSystem";
import { ApiError } from "../api/client";

// 우선순위 값(영어)을 화면에 보여줄 한글로 바꾼다
function priorityLabel(priority: TaskPriority) {
	if (priority === "HIGH") return "높음";
	if (priority === "MEDIUM") return "보통";
	return "낮음";
}

// 상태 값(영어)을 화면에 보여줄 한글로 바꾼다
function statusLabel(status: TaskStatus) {
	if (status === "TODO") return "예정";
	if (status === "IN_PROGRESS") return "진행중";
	return "완료";
}

export function TasksPage() {
	const [tasks, setTasks] = useState<TaskResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 폼에서 고를 선택지들 (프로젝트 드롭다운, 태그·시스템 체크박스용)
	const [projects, setProjects] = useState<ProjectResponse[]>([]);
	const [tags, setTags] = useState<TagResponse[]>([]);
	const [systems, setSystems] = useState<WorkSystemResponse[]>([]);

	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
	const [dueDate, setDueDate] = useState("");
	const [projectId, setProjectId] = useState<number | "">("");
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const [selectedSystemIds, setSelectedSystemIds] = useState<number[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	// 성과 항목(TaskResult) — 업무가 이미 있을 때(수정 모드)만 다룰 수 있다
	const [results, setResults] = useState<TaskResultResponse[]>([]);
	const [editingResultId, setEditingResultId] = useState<number | null>(null);
	const [metricName, setMetricName] = useState("");
	const [beforeValue, setBeforeValue] = useState("");
	const [afterValue, setAfterValue] = useState("");
	const [resultSubmitting, setResultSubmitting] = useState(false);
	const [resultError, setResultError] = useState<string | null>(null);

	useEffect(() => {
		loadTasks();
		// 폼에서 쓸 선택지들도 화면이 열릴 때 같이 불러온다
		getProjects().then(setProjects).catch(() => {});
		getTags().then(setTags).catch(() => {});
		getWorkSystems().then(setSystems).catch(() => {});
	}, []);

	function loadTasks() {
		setLoading(true);
		getTasks()
			.then(setTasks)
			.catch(() => setError("업무 목록을 불러오지 못했습니다."))
			.finally(() => setLoading(false));
	}

	function openCreateForm() {
		setEditingId(null);
		setTitle("");
		setDescription("");
		setPriority("MEDIUM");
		setDueDate("");
		setProjectId(projects[0]?.id ?? "");
		setSelectedTagIds([]);
		setSelectedSystemIds([]);
		setFormError(null);
		setResults([]);
		resetResultForm();
		setShowForm(true);
	}

	function openEditForm(task: TaskResponse) {
		setEditingId(task.id);
		setTitle(task.title);
		setDescription(task.description ?? "");
		setPriority(task.priority);
		setDueDate(task.dueDate ?? "");
		setProjectId(task.projectId);
		setSelectedTagIds(task.tags.map((t) => t.id));
		setSelectedSystemIds(task.systems.map((s) => s.id));
		setFormError(null);
		resetResultForm();
		loadResults(task.id);
		setShowForm(true);
	}

	function closeForm() {
		setShowForm(false);
		setEditingId(null);
	}

	// 성과 항목 목록 다시 불러오기 (추가·수정·삭제 뒤에 반복해서 쓴다)
	function loadResults(taskId: number) {
		getTaskResults(taskId)
			.then(setResults)
			.catch(() => {});
	}

	// 성과 항목 입력 폼을 새로 쓸 상태로 되돌린다 (추가 모드 기본값)
	function resetResultForm() {
		setEditingResultId(null);
		setMetricName("");
		setBeforeValue("");
		setAfterValue("");
		setResultError(null);
	}

	function openResultEditForm(result: TaskResultResponse) {
		setEditingResultId(result.id);
		setMetricName(result.metricName);
		setBeforeValue(result.beforeValue ?? "");
		setAfterValue(result.afterValue);
		setResultError(null);
	}

	// 성과 항목은 별도 <form> 없이 버튼 클릭으로 직접 처리한다 (업무 수정 폼 안에 폼을 중첩할 수 없어서)
	async function handleResultSubmit() {
		if (editingId === null) return;
		setResultError(null);

		if (!metricName || !afterValue) {
			setResultError("지표명과 개선 후 값을 입력해 주세요.");
			return;
		}

		setResultSubmitting(true);

		const request = {
			metricName,
			beforeValue: beforeValue || null,
			afterValue,
		};

		try {
			if (editingResultId !== null) {
				await updateTaskResult(editingId, editingResultId, request);
			} else {
				await createTaskResult(editingId, request);
			}
			resetResultForm();
			loadResults(editingId);
		} catch (e) {
			setResultError(e instanceof ApiError ? e.message : "저장 중 문제가 발생했습니다.");
		} finally {
			setResultSubmitting(false);
		}
	}

	async function handleDeleteResult(resultId: number) {
		if (editingId === null) return;

		const confirmed = window.confirm("이 성과 항목을 삭제할까요?");
		if (!confirmed) return;

		try {
			await deleteTaskResult(editingId, resultId);
			loadResults(editingId);
		} catch {
			alert("삭제에 실패했습니다.");
		}
	}

	// 체크박스 하나를 누르면, 선택 목록에 있으면 빼고 없으면 넣는다
	function toggleTag(id: number) {
		setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
	}

	function toggleSystem(id: number) {
		setSelectedSystemIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setFormError(null);

		if (projectId === "") {
			setFormError("프로젝트를 선택해 주세요.");
			return;
		}

		setSubmitting(true);

		const request = {
			title,
			description: description || null,
			priority,
			dueDate: dueDate || null,
			projectId: Number(projectId),
			tagIds: selectedTagIds,
			systemIds: selectedSystemIds,
		};

		try {
			if (editingId !== null) {
				await updateTask(editingId, request);
			} else {
				await createTask(request);
			}
			closeForm();
			loadTasks();
		} catch (e) {
			setFormError(e instanceof ApiError ? e.message : "저장 중 문제가 발생했습니다.");
		} finally {
			setSubmitting(false);
		}
	}

	// 카드의 상태 드롭다운: 수정 폼 없이 상태만 바로 바꾼다
	async function handleStatusChange(task: TaskResponse, status: TaskStatus) {
		try {
			await changeTaskStatus(task.id, { status });
			loadTasks();
		} catch {
			alert("상태 변경에 실패했습니다.");
		}
	}

	async function handleArchive(id: number) {
		const confirmed = window.confirm("이 업무를 보관할까요? 목록에서만 숨겨지고 데이터는 남습니다.");
		if (!confirmed) return;

		try {
			await archiveTask(id);
			loadTasks();
		} catch {
			alert("보관 처리에 실패했습니다.");
		}
	}

	return (
		<div className="page">
			<div className="page-header">
				<h1>업무</h1>
				<button
					className="btn-primary"
					style={{ width: "auto" }}
					onClick={() => (showForm ? closeForm() : openCreateForm())}
					disabled={projects.length === 0}
				>
					{showForm ? "취소" : "+ 새 업무"}
				</button>
			</div>

			{projects.length === 0 && !showForm && (
				<p className="empty-state">업무를 등록하려면 먼저 프로젝트를 만들어야 해요.</p>
			)}

			{showForm && (
				<form onSubmit={handleSubmit} className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
					<h2 style={{ fontSize: 16, textAlign: "left", margin: "0 0 16px" }}>
						{editingId !== null ? "업무 수정" : "새 업무 등록"}
					</h2>

					<div className="field">
						<label htmlFor="title">제목</label>
						<input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
					</div>

					<div className="field">
						<label htmlFor="description">설명</label>
						<input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
					</div>

					<div className="field">
						<label htmlFor="project">프로젝트</label>
						<select id="project" value={projectId} onChange={(e) => setProjectId(Number(e.target.value))}>
							{projects.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</select>
					</div>

					<div className="field">
						<label htmlFor="priority">우선순위</label>
						<select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
							<option value="HIGH">높음</option>
							<option value="MEDIUM">보통</option>
							<option value="LOW">낮음</option>
						</select>
					</div>

					<div className="field">
						<label htmlFor="dueDate">마감일</label>
						<input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
					</div>

					{tags.length > 0 && (
						<div className="field">
							<label>태그</label>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
								{tags.map((tag) => (
									<label
										key={tag.id}
										className={`chip-toggle${selectedTagIds.includes(tag.id) ? " checked" : ""}`}
									>
										<input type="checkbox" checked={selectedTagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
										{tag.name}
									</label>
								))}
							</div>
						</div>
					)}

					{systems.length > 0 && (
						<div className="field">
							<label>업무 시스템</label>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
								{systems.map((system) => (
									<label
										key={system.id}
										className={`chip-toggle${selectedSystemIds.includes(system.id) ? " checked" : ""}`}
									>
										<input
											type="checkbox"
											checked={selectedSystemIds.includes(system.id)}
											onChange={() => toggleSystem(system.id)}
										/>
										{system.name}
									</label>
								))}
							</div>
						</div>
					)}

					{formError && <p className="error-text">{formError}</p>}

					<button type="submit" className="btn-primary" disabled={submitting}>
						{submitting ? "저장 중..." : editingId !== null ? "수정 완료" : "등록"}
					</button>
				</form>
			)}

			{showForm && editingId !== null && (
				<div className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
					<h2 style={{ fontSize: 16, textAlign: "left", margin: "0 0 16px" }}>성과 항목</h2>

					<div className="list">
						{results.map((result) => (
							<div className="list-item" key={result.id}>
								<div className="list-item-top">
									<div>
										<p className="list-item-title">{result.metricName}</p>
										<p className="list-item-meta">
											{result.beforeValue ? `${result.beforeValue} → ${result.afterValue}` : result.afterValue}
										</p>
									</div>
									<div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
										<button className="btn-secondary" type="button" onClick={() => openResultEditForm(result)}>
											수정
										</button>
										<button className="btn-danger" type="button" onClick={() => handleDeleteResult(result.id)}>
											삭제
										</button>
									</div>
								</div>
							</div>
						))}
						{results.length === 0 && <p className="empty-state">아직 등록한 성과가 없습니다.</p>}
					</div>

					<div className="field" style={{ marginTop: 16 }}>
						<label htmlFor="metricName">지표명</label>
						<input
							id="metricName"
							value={metricName}
							onChange={(e) => setMetricName(e.target.value)}
							maxLength={100}
						/>
					</div>

					<div className="field">
						<label htmlFor="beforeValue">개선 전 (선택)</label>
						<input id="beforeValue" value={beforeValue} onChange={(e) => setBeforeValue(e.target.value)} />
					</div>

					<div className="field">
						<label htmlFor="afterValue">개선 후</label>
						<input
							id="afterValue"
							value={afterValue}
							onChange={(e) => setAfterValue(e.target.value)}
							maxLength={200}
						/>
					</div>

					{resultError && <p className="error-text">{resultError}</p>}

					<div style={{ display: "flex", gap: 8 }}>
						<button
							className="btn-primary"
							type="button"
							style={{ width: "auto" }}
							onClick={handleResultSubmit}
							disabled={resultSubmitting}
						>
							{resultSubmitting ? "저장 중..." : editingResultId !== null ? "수정 완료" : "추가"}
						</button>
						{editingResultId !== null && (
							<button className="btn-secondary" type="button" style={{ width: "auto" }} onClick={resetResultForm}>
								취소
							</button>
						)}
					</div>
				</div>
			)}

			{loading && <p>불러오는 중...</p>}
			{error && <p className="error-text">{error}</p>}

			{!loading && !error && tasks.length === 0 && <p className="empty-state">아직 업무가 없습니다.</p>}

			<div className="list">
				{tasks.map((task) => {
					const project = projects.find((p) => p.id === task.projectId);
					return (
						<div className="list-item" key={task.id}>
							<div className="list-item-top">
								<div>
									<p className="list-item-title">{task.title}</p>
									<p className="list-item-meta">
										{project?.name ?? `프로젝트 #${task.projectId}`} · {priorityLabel(task.priority)}
									</p>
									{(task.tags.length > 0 || task.systems.length > 0) && (
										<div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
											{task.tags.map((tag) => (
												<span key={tag.id} className="chip">
													{tag.name}
												</span>
											))}
											{task.systems.map((system) => (
												<span key={system.id} className="chip">
													{system.name}
												</span>
											))}
										</div>
									)}
									{task.dueDate && <p className="list-item-meta">마감: {task.dueDate}</p>}
								</div>
								<div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
									<select
										className="status-select"
										value={task.status}
										onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
									>
										<option value="TODO">{statusLabel("TODO")}</option>
										<option value="IN_PROGRESS">{statusLabel("IN_PROGRESS")}</option>
										<option value="DONE">{statusLabel("DONE")}</option>
									</select>
									<button className="btn-secondary" onClick={() => openEditForm(task)}>
										수정
									</button>
									<button className="btn-danger" onClick={() => handleArchive(task.id)}>
										보관
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
