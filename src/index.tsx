/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.tsx";
import Privacy from "./Privacy.tsx";
import NotFound from "./NotFound.tsx";

const root = document.getElementById("root");

if (window.location.pathname === "/about/privacy") {
  render(() => <Privacy />, root!);
} else if (window.location.pathname === "/") {
  render(() => <App />, root!);
} else {
  const aliases = localStorage.getItem("aliases");
  const parsedAliases = aliases ? JSON.parse(aliases) : {};
  const trimmedPathname = window.location.pathname.startsWith("/")
    ? window.location.pathname.slice(1)
    : window.location.pathname;
  if (Object.keys(parsedAliases).length > 0 && parsedAliases[trimmedPathname]) {
    window.location.href = parsedAliases[trimmedPathname];
  } else {
    render(() => <NotFound />, root!);
  }
}
