import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createProject, getProjects, archiveProject } from "../api/projects";
import type { ProjectResponse } from "../types/project";
import { ApiError } from "../api/client";

function getTodayString() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`; 
}

export function ProjectsPage() {
	const [projects, setProjects] = useState<ProjectResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 새 프로젝트 등록 폼을 보여줄지 여부 (버튼을 누르면 토글)
	const [showForm, setShowForm] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [startDate, setStartDate] = useState(getTodayString());
	const [endDate, setEndDate] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		loadProjects();
	}, []);

	function loadProjects() {
		setLoading(true);
		getProjects()
			.then(setProjects)
			.catch(() => setError("프로젝트 목록을 불러오지 못했습니다."))
			.finally(() => setLoading(false));
	}

	async function handleCreate(e: FormEvent) {
		e.preventDefault();
		setFormError(null);
		setSubmitting(true);

		try {
			// 빈 문자열은 null로 바꿔서 보낸다 (선택 입력 항목이라서)
			await createProject({
				name,
				description: description || null,
				startDate: startDate || null,
				endDate: endDate || null,
			});

			// 성공하면 폼을 비우고 닫은 뒤, 목록을 새로 불러온다
			setName("");
			setDescription("");
			setStartDate(getTodayString());
			setEndDate("");
			setShowForm(false);
			loadProjects();
		} catch (e) {
			setFormError(
				e instanceof ApiError ? e.message : "프로젝트 등록 중 문제가 발생했습니다.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleArchive(id: number) {
		const confirmed = window.confirm(
			"이 프로젝트를 보관할까요? 목록에서만 숨겨지고 데이터는 남습니다.",
		);
		if (!confirmed) return;

		try {
			await archiveProject(id);
			loadProjects();
		} catch {
			alert("보관 처리에 실패했습니다.");
		}
	}

	return (
		<div className="page">
			<div className="page-header">
				<h1>프로젝트</h1>
				<button
					className="btn-primary"
					style={{ width: "auto" }}
					onClick={() => setShowForm((v) => !v)}
				>
					{showForm ? "취소" : "+ 새 프로젝트"}
				</button>
			</div>

			{showForm && (
				<form onSubmit={handleCreate} className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
					<div className="field">
						<label htmlFor="name">이름</label>
						<input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={100}
							required
						/>
					</div>

					<div className="field">
						<label htmlFor="description">설명</label>
						<input
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div className="field">
						<label htmlFor="startDate">시작일</label>
						<input
							id="startDate"
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>

					<div className="field">
						<label htmlFor="endDate">종료일</label>
						<input
							id="endDate"
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</div>

					{formError && <p className="error-text">{formError}</p>}

					<button type="submit" className="btn-primary" disabled={submitting}>
						{submitting ? "등록 중..." : "등록"}
					</button>
				</form>
			)}

			{loading && <p>불러오는 중...</p>}
			{error && <p className="error-text">{error}</p>}

			{!loading && !error && projects.length === 0 && (
				<p className="empty-state">아직 프로젝트가 없습니다. 새 프로젝트를 등록해 보세요.</p>
			)}

			<div className="list">
				{projects.map((project) => (
					<div className="list-item" key={project.id}>
						<div className="list-item-top">
							<div>
								<p className="list-item-title">{project.name}</p>
								{project.description && (
									<p className="list-item-desc">{project.description}</p>
								)}
								{(project.startDate || project.endDate) && (
									<p className="list-item-meta">
										{project.startDate ?? "?"} ~ {project.endDate ?? "진행 중"}
									</p>
								)}
							</div>
							<button className="btn-danger" onClick={() => handleArchive(project.id)}>
								보관
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
