import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import "./index.css";
import {LoginPage} from "@/pages/LoginPage";

import App from "./App.tsx";

// /login renders the sign-in screen; every other path is the Hub. Keeping this split out of <App>
// avoids the Hub's router/feature-resolution running on the login route.
const isLogin = window.location.pathname === "/login";

createRoot(document.getElementById("root")!).render(<StrictMode>{isLogin ? <LoginPage /> : <App />}</StrictMode>);
