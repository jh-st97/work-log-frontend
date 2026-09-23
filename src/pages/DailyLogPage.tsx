import { useEffect, useState } from "react";
import { getDailyLog, saveDailyLog } from "../api/dailyLogs";
import { createTaskLog, deleteTaskLog, updateTaskLog } from "../api/taskLogs";
import { getTasks } from "../api/tasks";
import type { TaskLogResponse } from "../types/taskLog";
import type { TaskResponse } from "../types/task";
import { ApiError } from "../api/client";

// 오늘 날짜를 "2026-09-23" 형식 문자열로 만든다
function todayString() {
	const now = new Date();
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, "0");
	const dd = String(now.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

// 날짜 문자열에 며칠을 더하거나 뺀다 (이전 날/다음 날 버튼용)
function addDays(date: string, amount: number) {
	const d = new Date(`${date}T00:00:00`);
	d.setDate(d.getDate() + amount);
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

export function DailyLogPage() {
	const [date, setDate] = useState(todayString());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [summary, setSummary] = useState("");
	const [summarySaving, setSummarySaving] = useState(false);
	const [summarySaved, setSummarySaved] = useState(false);

	const [taskLogs, setTaskLogs] = useState<TaskLogResponse[]>([]);
	const [tasks, setTasks] = useState<TaskResponse[]>([]);

	const [showLogForm, setShowLogForm] = useState(false);
	const [editingLogId, setEditingLogId] = useState<number | null>(null);
	const [formTaskId, setFormTaskId] = useState<number | "">("");
	const [formContent, setFormContent] = useState("");
	const [formSpentMinutes, setFormSpentMinutes] = useState("");
	const [formSubmitting, setFormSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	// 업무 목록은 날짜와 무관하게 한 번만 불러온다 (진행 메모 등록 폼의 업무 선택용)
	useEffect(() => {
		getTasks().then(setTasks).catch(() => {});
	}, []);

	// 날짜가 바뀔 때마다 그날의 일지를 다시 불러온다
	useEffect(() => {
		loadDailyLog(date);
		closeLogForm();
	}, [date]);

	function loadDailyLog(targetDate: string) {
		setLoading(true);
		setError(null);

		getDailyLog(targetDate)
			.then((dailyLog) => {
				setSummary(dailyLog.summary ?? "");
				setTaskLogs(dailyLog.taskLogs);
			})
			.catch((e) => {
				// 아직 아무것도 기록 안 한 날은 404가 정상이다 — 에러로 취급하지 않고 빈 상태로 보여준다
				if (e instanceof ApiError && e.code === "DAILY_LOG_NOT_FOUND") {
					setSummary("");
					setTaskLogs([]);
					return;
				}
				setError("일지를 불러오지 못했습니다.");
			})
			.finally(() => setLoading(false));
	}

	async function handleSaveSummary() {
		setSummarySaving(true);
		setSummarySaved(false);

		try {
			const dailyLog = await saveDailyLog(date, { summary: summary || null });
			setTaskLogs(dailyLog.taskLogs);
			setSummarySaved(true);
		} catch {
			setError("회고 저장에 실패했습니다.");
		} finally {
			setSummarySaving(false);
		}
	}

	function openAddLogForm() {
		setEditingLogId(null);
		setFormTaskId(tasks[0]?.id ?? "");
		setFormContent("");
		setFormSpentMinutes("");
		setFormError(null);
		setShowLogForm(true);
	}

	function openEditLogForm(log: TaskLogResponse) {
		setEditingLogId(log.id);
		setFormTaskId(log.taskId);
		setFormContent(log.content);
		setFormSpentMinutes(log.spentMinutes !== null ? String(log.spentMinutes) : "");
		setFormError(null);
		setShowLogForm(true);
	}

	function closeLogForm() {
		setShowLogForm(false);
		setEditingLogId(null);
	}

	async function handleLogSubmit() {
		setFormError(null);

		if (formTaskId === "" || !formContent) {
			setFormError("업무와 내용을 입력해 주세요.");
			return;
		}

		setFormSubmitting(true);

		const spentMinutes = formSpentMinutes ? Number(formSpentMinutes) : null;

		try {
			if (editingLogId !== null) {
				await updateTaskLog(editingLogId, { content: formContent, spentMinutes });
			} else {
				await createTaskLog(date, { taskId: Number(formTaskId), content: formContent, spentMinutes });
			}
			closeLogForm();
			loadDailyLog(date);
		} catch (e) {
			setFormError(e instanceof ApiError ? e.message : "저장 중 문제가 발생했습니다.");
		} finally {
			setFormSubmitting(false);
		}
	}

	async function handleDeleteLog(id: number) {
		const confirmed = window.confirm("이 진행 메모를 삭제할까요?");
		if (!confirmed) return;

		try {
			await deleteTaskLog(id);
			loadDailyLog(date);
		} catch {
			alert("삭제에 실패했습니다.");
		}
	}

	return (
		<div className="page">
			<div className="page-header">
				<h1>일일 기록</h1>
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
				<button className="btn-secondary" onClick={() => setDate(addDays(date, -1))}>
					◀ 이전 날
				</button>
				<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-date" />
				<button className="btn-secondary" onClick={() => setDate(addDays(date, 1))}>
					다음 날 ▶
				</button>
				{date !== todayString() && (
					<button className="btn-secondary" onClick={() => setDate(todayString())}>
						오늘로
					</button>
				)}
			</div>

			{loading && <p>불러오는 중...</p>}
			{error && <p className="error-text">{error}</p>}

			{!loading && (
				<>
					<div className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
						<h2 style={{ fontSize: 16, textAlign: "left", margin: "0 0 16px" }}>하루 회고</h2>
						<div className="field">
							<textarea
								value={summary}
								onChange={(e) => {
									setSummary(e.target.value);
									setSummarySaved(false);
								}}
								rows={4}
								placeholder="오늘 하루를 한두 줄로 돌아보기"
							/>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<button
								className="btn-primary"
								type="button"
								style={{ width: "auto" }}
								onClick={handleSaveSummary}
								disabled={summarySaving}
							>
								{summarySaving ? "저장 중..." : "회고 저장"}
							</button>
							{summarySaved && <span style={{ fontSize: 13, color: "var(--accent)" }}>저장됐습니다</span>}
						</div>
					</div>

					<div className="page-header" style={{ marginBottom: 12 }}>
						<h2 style={{ fontSize: 16 }}>진행 메모</h2>
						<button
							className="btn-primary"
							style={{ width: "auto" }}
							onClick={() => (showLogForm ? closeLogForm() : openAddLogForm())}
							disabled={tasks.length === 0}
						>
							{showLogForm ? "취소" : "+ 진행 메모"}
						</button>
					</div>

					{tasks.length === 0 && !showLogForm && (
						<p className="empty-state">진행 메모를 남기려면 먼저 업무를 등록해야 해요.</p>
					)}

					{showLogForm && (
						<div className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
							<div className="field">
								<label htmlFor="logTask">업무</label>
								<select
									id="logTask"
									value={formTaskId}
									onChange={(e) => setFormTaskId(Number(e.target.value))}
									disabled={editingLogId !== null}
								>
									{tasks.map((task) => (
										<option key={task.id} value={task.id}>
											{task.title}
										</option>
									))}
								</select>
							</div>

							<div className="field">
								<label htmlFor="logContent">내용</label>
								<textarea
									id="logContent"
									value={formContent}
									onChange={(e) => setFormContent(e.target.value)}
									rows={3}
									placeholder="겪은 문제와 해결 방법"
								/>
							</div>

							<div className="field">
								<label htmlFor="logSpentMinutes">소요 시간(분)</label>
								<input
									id="logSpentMinutes"
									type="number"
									min={0}
									value={formSpentMinutes}
									onChange={(e) => setFormSpentMinutes(e.target.value)}
								/>
							</div>

							{formError && <p className="error-text">{formError}</p>}

							<button className="btn-primary" type="button" onClick={handleLogSubmit} disabled={formSubmitting}>
								{formSubmitting ? "저장 중..." : editingLogId !== null ? "수정 완료" : "등록"}
							</button>
						</div>
					)}

					{taskLogs.length === 0 && !showLogForm && <p className="empty-state">그날 남긴 진행 메모가 없습니다.</p>}

					<div className="list">
						{taskLogs.map((log) => (
							<div className="list-item" key={log.id}>
								<div className="list-item-top">
									<div>
										<p className="list-item-title">{log.taskTitle}</p>
										<p className="list-item-meta">{log.content}</p>
										{log.spentMinutes !== null && <p className="list-item-meta">{log.spentMinutes}분</p>}
									</div>
									<div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
										<button className="btn-secondary" onClick={() => openEditLogForm(log)}>
											수정
										</button>
										<button className="btn-danger" onClick={() => handleDeleteLog(log.id)}>
											삭제
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
