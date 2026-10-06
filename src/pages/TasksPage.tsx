import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { archiveTask, changeTaskStatus, createTask, getTasks, restoreTask, updateTask } from "../api/tasks";
import type { TaskListParams } from "../api/tasks";
import { createTaskResult, deleteTaskResult, getTaskResults, updateTaskResult } from "../api/taskResults";
import { getProjects } from "../api/projects";
import { getTags } from "../api/tags";
import { getWorkSystems } from "../api/workSystems";
import { getResumeMarkdown } from "../api/exports";
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

	// 목록 필터. status/priority/projectId/systemId/tagId는 ""면 "전체"(필터 안 걸음)를 뜻한다.
	const [filterStatus, setFilterStatus] = useState<TaskStatus | "">("");
	const [filterPriority, setFilterPriority] = useState<TaskPriority | "">("");
	const [filterProjectId, setFilterProjectId] = useState<number | "">("");
	const [filterSystemId, setFilterSystemId] = useState<number | "">("");
	const [filterTagId, setFilterTagId] = useState<number | "">("");
	const [keywordInput, setKeywordInput] = useState(""); // 입력 중인 값
	const [keyword, setKeyword] = useState(""); // 실제로 검색에 쓰는 값 (검색 버튼/Enter로 확정)

	// 페이징. page는 0부터 시작(백엔드와 동일)
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);

	// 이력서용 내보내기. 선택한 업무 번호는 페이지를 넘겨도 유지된다.
	const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
	const [exportMarkdown, setExportMarkdown] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	// 폼에서 쓸 선택지들은 화면이 열릴 때 한 번만 불러온다
	useEffect(() => {
		getProjects().then(setProjects).catch(() => {});
		getTags().then(setTags).catch(() => {});
		getWorkSystems().then(setSystems).catch(() => {});
	}, []);

	// true면 보관한 업무만 보여준다(보관함)
	const [showArchived, setShowArchived] = useState(false);

	// 필터나 페이지가 바뀔 때마다 목록을 다시 불러온다
	useEffect(() => {
		loadTasks();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterStatus, filterPriority, filterProjectId, filterSystemId, filterTagId, keyword, showArchived, page]);

	function loadTasks() {
		setLoading(true);

		const params: TaskListParams = {
			status: filterStatus || undefined,
			priority: filterPriority || undefined,
			projectId: filterProjectId === "" ? undefined : filterProjectId,
			systemId: filterSystemId === "" ? undefined : filterSystemId,
			tagId: filterTagId === "" ? undefined : filterTagId,
			keyword: keyword || undefined,
			archived: showArchived,
			page,
		};

		getTasks(params)
			.then((result) => {
				setTasks(result.content);
				setTotalPages(result.totalPages);
				setTotalElements(result.totalElements);
			})
			.catch(() => setError("업무 목록을 불러오지 못했습니다."))
			.finally(() => setLoading(false));
	}

	// 필터를 바꾸면 0페이지로 되돌아간다 — 필터링된 결과가 지금 보던 페이지보다 적을 수 있어서
	function updateFilter(update: () => void) {
		update();
		setPage(0);
	}

	function handleSearch() {
		updateFilter(() => setKeyword(keywordInput));
	}

	function toggleSelectedTask(id: number) {
		setSelectedTaskIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
	}

	async function handleExport() {
		setExporting(true);
		setExportError(null);
		setCopied(false);

		try {
			const result = await getResumeMarkdown(selectedTaskIds);
			setExportMarkdown(result.markdown);
		} catch (e) {
			setExportError(e instanceof ApiError ? e.message : "내보내기에 실패했습니다.");
		} finally {
			setExporting(false);
		}
	}

	async function handleCopy() {
		if (exportMarkdown === null) return;
		try {
			await navigator.clipboard.writeText(exportMarkdown);
			setCopied(true);
		} catch {
			alert("복사에 실패했습니다. 미리보기 글을 직접 선택해서 복사해 주세요.");
		}
	}

	// 마크다운 문자열을 파일로 만들어 내려받는다 (서버를 거치지 않고 브라우저에서 처리)
	function handleDownload() {
		if (exportMarkdown === null) return;
		const url = URL.createObjectURL(new Blob([exportMarkdown], { type: "text/markdown;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "work-log-resume.md";
		link.click();
		URL.revokeObjectURL(url);
	}

	function resetFilters() {
		setFilterStatus("");
		setFilterPriority("");
		setFilterProjectId("");
		setFilterSystemId("");
		setFilterTagId("");
		setKeywordInput("");
		setKeyword("");
		setPage(0);
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

	// 프로젝트가 보관 중이면 서버가 409로 막고 "프로젝트를 먼저 복구해 주세요"라고 알려준다
	async function handleRestore(id: number) {
		try {
			await restoreTask(id);
			loadTasks();
		} catch (e) {
			alert(e instanceof ApiError ? e.message : "복구에 실패했습니다.");
		}
	}

	return (
		<div className="page">
			<div className="page-header">
				<h1>{showArchived ? "업무 보관함" : "업무"}</h1>
				<button
					className="btn-primary"
					style={{ width: "auto" }}
					onClick={() => (showForm ? closeForm() : openCreateForm())}
					disabled={projects.length === 0 || showArchived}
				>
					{showForm ? "취소" : "+ 새 업무"}
				</button>
			</div>

			<label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 16 }}>
				<input
					type="checkbox"
					checked={showArchived}
					onChange={(e) => {
						setShowArchived(e.target.checked);
						setPage(0);
						closeForm();
					}}
				/>
				보관함 보기
			</label>

			<div className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
				<div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
					<select
						className="status-select"
						value={filterStatus}
						onChange={(e) => updateFilter(() => setFilterStatus(e.target.value as TaskStatus | ""))}
					>
						<option value="">상태: 전체</option>
						<option value="TODO">{statusLabel("TODO")}</option>
						<option value="IN_PROGRESS">{statusLabel("IN_PROGRESS")}</option>
						<option value="DONE">{statusLabel("DONE")}</option>
					</select>

					<select
						className="status-select"
						value={filterPriority}
						onChange={(e) => updateFilter(() => setFilterPriority(e.target.value as TaskPriority | ""))}
					>
						<option value="">우선순위: 전체</option>
						<option value="HIGH">높음</option>
						<option value="MEDIUM">보통</option>
						<option value="LOW">낮음</option>
					</select>

					<select
						className="status-select"
						value={filterProjectId}
						onChange={(e) => updateFilter(() => setFilterProjectId(e.target.value ? Number(e.target.value) : ""))}
					>
						<option value="">프로젝트: 전체</option>
						{projects.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>

					<select
						className="status-select"
						value={filterSystemId}
						onChange={(e) => updateFilter(() => setFilterSystemId(e.target.value ? Number(e.target.value) : ""))}
					>
						<option value="">업무 시스템: 전체</option>
						{systems.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>

					<select
						className="status-select"
						value={filterTagId}
						onChange={(e) => updateFilter(() => setFilterTagId(e.target.value ? Number(e.target.value) : ""))}
					>
						<option value="">태그: 전체</option>
						{tags.map((t) => (
							<option key={t.id} value={t.id}>
								{t.name}
							</option>
						))}
					</select>

					<input
						value={keywordInput}
						onChange={(e) => setKeywordInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						placeholder="제목·설명 검색"
						style={{
							height: 41,
							padding: "0 14px",
							border: "1px solid var(--border)",
							borderRadius: 10,
							fontSize: 14,
						}}
					/>
					<button className="btn-secondary" onClick={handleSearch}>
						검색
					</button>
					<button className="btn-secondary" onClick={resetFilters}>
						필터 초기화
					</button>
				</div>
			</div>

			{selectedTaskIds.length > 0 && (
				<div className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
						<span style={{ fontSize: 14, color: "var(--text-h)" }}>{selectedTaskIds.length}개 업무 선택됨</span>
						<button className="btn-primary" style={{ width: "auto" }} onClick={handleExport} disabled={exporting}>
							{exporting ? "만드는 중..." : "이력서용 내보내기"}
						</button>
						<button className="btn-secondary" onClick={() => setSelectedTaskIds([])}>
							선택 해제
						</button>
					</div>
					{exportError && <p className="error-text">{exportError}</p>}
				</div>
			)}

			{exportMarkdown !== null && (
				<div className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
					<h2 style={{ fontSize: 16, textAlign: "left", margin: "0 0 12px" }}>이력서용 마크다운 미리보기</h2>
					<div className="field">
						<textarea
							readOnly
							value={exportMarkdown}
							rows={16}
							style={{ fontFamily: "var(--mono)", fontSize: 13 }}
						/>
					</div>
					<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
						<button className="btn-primary" style={{ width: "auto" }} onClick={handleCopy}>
							복사
						</button>
						<button className="btn-secondary" onClick={handleDownload}>
							파일로 저장 (.md)
						</button>
						<button className="btn-secondary" onClick={() => setExportMarkdown(null)}>
							닫기
						</button>
						{copied && <span style={{ fontSize: 13, color: "var(--accent)" }}>복사됐습니다</span>}
					</div>
				</div>
			)}

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
									<label
										style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)" }}
									>
										<input
											type="checkbox"
											checked={selectedTaskIds.includes(task.id)}
											onChange={() => toggleSelectedTask(task.id)}
										/>
										내보내기용 선택
									</label>
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
									{showArchived ? (
										<button className="btn-secondary" onClick={() => handleRestore(task.id)}>
											복구
										</button>
									) : (
										<>
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
										</>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{totalPages > 1 && (
				<div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginTop: 20 }}>
					<button className="btn-secondary" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
						◀ 이전
					</button>
					<span style={{ fontSize: 14, color: "var(--text)" }}>
						{page + 1} / {totalPages} 페이지 (총 {totalElements}개)
					</span>
					<button
						className="btn-secondary"
						onClick={() => setPage((p) => p + 1)}
						disabled={page + 1 >= totalPages}
					>
						다음 ▶
					</button>
				</div>
			)}
		</div>
	);
}
