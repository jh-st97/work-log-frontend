import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { HomePage } from "./pages/HomePage";
import { RequireAuth } from "./auth/RequireAuth";

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />
			{/* "/" 경로는 RequireAuth로 감싸서, 로그인 안 했으면 자동으로 /login으로 보낸다 */}
			<Route
				path="/"
				element={
					<RequireAuth>
						<HomePage />
					</RequireAuth>
				}
			/>
		</Routes>
	);
}

export default App;
