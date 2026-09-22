import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { createTag, deleteTag, getTags, updateTag } from "../api/tags";
import type { TagResponse } from "../types/tag";
import { ApiError } from "../api/client";

export function TagsPage() {
	const [tags, setTags] = useState<TagResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [showForm, setShowForm] = useState(false);
	const [name, setName] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	// 지금 이름을 수정 중인 태그의 id. null이면 아무것도 수정 중이 아니다.
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingValue, setEditingValue] = useState("");
	const [editError, setEditError] = useState<string | null>(null);

	useEffect(() => {
		loadTags();
	}, []);

	function loadTags() {
		setLoading(true);
		getTags()
			.then(setTags)
			.catch(() => setError("태그 목록을 불러오지 못했습니다."))
			.finally(() => setLoading(false));
	}

	async function handleCreate(e: FormEvent) {
		e.preventDefault();
		setFormError(null);
		setSubmitting(true);

		try {
			await createTag({ name });
			setName("");
			setShowForm(false);
			loadTags();
		} catch (e) {
			// 이름이 중복되면 백엔드가 409 TAG_DUPLICATED를 준다. 그 메시지를 그대로 보여준다.
			setFormError(e instanceof ApiError ? e.message : "태그 등록 중 문제가 발생했습니다.");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: number) {
		// 태그는 보관이 아니라 진짜 삭제라서, 프로젝트보다 문구를 더 분명히 한다.
		const confirmed = window.confirm("이 태그를 삭제할까요? 되돌릴 수 없습니다.");
		if (!confirmed) return;

		try {
			await deleteTag(id);
			loadTags();
		} catch {
			alert("삭제에 실패했습니다.");
		}
	}

	// 태그 이름을 클릭하면 그 자리가 입력창으로 바뀌면서 수정 모드가 된다
	function startEdit(tag: TagResponse) {
		setEditingId(tag.id);
		setEditingValue(tag.name);
		setEditError(null);
	}

	function cancelEdit() {
		setEditingId(null);
		setEditError(null);
	}

	async function submitEdit(id: number) {
		// 빈 값으로 저장하려 하면 그냥 취소 처리
		if (!editingValue.trim()) {
			cancelEdit();
			return;
		}

		try {
			await updateTag(id, { name: editingValue });
			setEditingId(null);
			loadTags();
		} catch (e) {
			setEditError(e instanceof ApiError ? e.message : "수정 중 문제가 발생했습니다.");
		}
	}

	function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>, id: number) {
		if (e.key === "Enter") {
			e.preventDefault();
			submitEdit(id);
		} else if (e.key === "Escape") {
			cancelEdit();
		}
	}

	return (
		<div className="page">
			<div className="page-header">
				<h1>태그</h1>
				<button
					className="btn-primary"
					style={{ width: "auto" }}
					onClick={() => setShowForm((v) => !v)}
				>
					{showForm ? "취소" : "+ 새 태그"}
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
							maxLength={50}
							required
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
			{editError && <p className="error-text">{editError}</p>}

			{!loading && !error && tags.length === 0 && (
				<p className="empty-state">아직 태그가 없습니다. 새 태그를 등록해 보세요.</p>
			)}

			<p style={{ fontSize: 13, color: "var(--text)", opacity: 0.7, marginBottom: 12 }}>
				이름을 클릭하면 수정할 수 있어요. (Enter: 저장, Esc: 취소)
			</p>

			{/* 태그는 항목이 짧아서 카드 목록 대신, 알약 모양으로 나란히 보여준다 */}
			<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
				{tags.map((tag) => (
					<div
						key={tag.id}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
							padding: "8px 8px 8px 16px",
							borderRadius: 999,
							background: "var(--accent-bg)",
							border: "1px solid var(--accent-border)",
						}}
					>
						{editingId === tag.id ? (
							<input
								autoFocus
								value={editingValue}
								onChange={(e) => setEditingValue(e.target.value)}
								onKeyDown={(e) => handleEditKeyDown(e, tag.id)}
								onBlur={cancelEdit}
								maxLength={50}
								style={{
									fontSize: 14,
									width: 110,
									border: "1px solid var(--accent)",
									borderRadius: 6,
									outline: "none",
									background: "var(--bg)",
									color: "var(--text-h)",
									padding: "2px 6px",
								}}
							/>
						) : (
							<span
								onClick={() => startEdit(tag)}
								style={{ fontSize: 14, color: "var(--text-h)", cursor: "pointer" }}
							>
								{tag.name}
							</span>
						)}
						<button
							onClick={() => handleDelete(tag.id)}
							aria-label={`${tag.name} 삭제`}
							style={{
								width: 20,
								height: 20,
								border: "none",
								borderRadius: "50%",
								background: "transparent",
								color: "var(--text)",
								cursor: "pointer",
								fontSize: 14,
								lineHeight: 1,
							}}
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
