import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TagsPage } from "./pages/TagsPage";
import { RequireAuth } from "./auth/RequireAuth";
import { Layout } from "./components/Layout";

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />

			{/* "/" 이하 경로는 전부 로그인이 필요하고, 같은 상단바(Layout)를 공유한다.
			    RequireAuth가 로그인 여부를 먼저 확인하고, 통과하면 Layout이 그려진다.
			    Layout 안의 <Outlet />에 아래 중첩된 라우트(index=ProjectsPage 등)가 끼워진다. */}
			<Route
				path="/"
				element={
					<RequireAuth>
						<Layout />
					</RequireAuth>
				}
			>
				<Route index element={<ProjectsPage />} />
				<Route path="tags" element={<TagsPage />} />
			</Route>
		</Routes>
	);
}

export default App;
