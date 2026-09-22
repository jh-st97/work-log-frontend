import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
	createWorkSystem,
	deleteWorkSystem,
	getWorkSystems,
	updateWorkSystem,
} from "../api/workSystems";
import type { WorkSystemResponse } from "../types/workSystem";
import { ApiError } from "../api/client";

export function WorkSystemsPage() {
	const [systems, setSystems] = useState<WorkSystemResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [showForm, setShowForm] = useState(false);
	// null이면 "새로 등록" 모드, 값이 있으면 "그 시스템을 수정하는" 모드
	const [editingId, setEditingId] = useState<number | null>(null);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		loadSystems();
	}, []);

	function loadSystems() {
		setLoading(true);
		getWorkSystems()
			.then(setSystems)
			.catch(() => setError("업무 시스템 목록을 불러오지 못했습니다."))
			.finally(() => setLoading(false));
	}

	function openCreateForm() {
		setEditingId(null);
		setName("");
		setDescription("");
		setFormError(null);
		setShowForm(true);
	}

	function openEditForm(system: WorkSystemResponse) {
		setEditingId(system.id);
		setName(system.name);
		setDescription(system.description ?? "");
		setFormError(null);
		setShowForm(true);
	}

	function closeForm() {
		setShowForm(false);
		setEditingId(null);
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setFormError(null);
		setSubmitting(true);

		const request = { name, description: description || null };

		try {
			if (editingId !== null) {
				await updateWorkSystem(editingId, request);
			} else {
				await createWorkSystem(request);
			}

			closeForm();
			loadSystems();
		} catch (e) {
			// 이름이 중복되면 백엔드가 409 WORK_SYSTEM_DUPLICATED를 준다
			setFormError(
				e instanceof ApiError
					? e.message
					: `업무 시스템 ${editingId !== null ? "수정" : "등록"} 중 문제가 발생했습니다.`,
			);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: number) {
		// 태그와 마찬가지로 보관이 아니라 진짜 삭제
		const confirmed = window.confirm("이 업무 시스템을 삭제할까요? 되돌릴 수 없습니다.");
		if (!confirmed) return;

		try {
			await deleteWorkSystem(id);
			loadSystems();
		} catch {
			alert("삭제에 실패했습니다.");
		}
	}

	return (
		<div className="page">
			<div className="page-header">
				<h1>업무 시스템</h1>
				<button
					className="btn-primary"
					style={{ width: "auto" }}
					onClick={() => (showForm ? closeForm() : openCreateForm())}
				>
					{showForm ? "취소" : "+ 새 시스템"}
				</button>
			</div>

			{showForm && (
				<form onSubmit={handleSubmit} className="card" style={{ maxWidth: "100%", marginBottom: 24 }}>
					<h2 style={{ fontSize: 16, textAlign: "left", margin: "0 0 16px" }}>
						{editingId !== null ? "업무 시스템 수정" : "새 업무 시스템 등록"}
					</h2>

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

					{formError && <p className="error-text">{formError}</p>}

					<button type="submit" className="btn-primary" disabled={submitting}>
						{submitting ? "저장 중..." : editingId !== null ? "수정 완료" : "등록"}
					</button>
				</form>
			)}

			{loading && <p>불러오는 중...</p>}
			{error && <p className="error-text">{error}</p>}

			{!loading && !error && systems.length === 0 && (
				<p className="empty-state">아직 업무 시스템이 없습니다. 새로 등록해 보세요.</p>
			)}

			<div className="list">
				{systems.map((system) => (
					<div className="list-item" key={system.id}>
						<div className="list-item-top">
							<div>
								<p className="list-item-title">{system.name}</p>
								{system.description && (
									<p className="list-item-desc">{system.description}</p>
								)}
							</div>
							<div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
								<button className="btn-secondary" onClick={() => openEditForm(system)}>
									수정
								</button>
								<button className="btn-danger" onClick={() => handleDelete(system.id)}>
									삭제
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
