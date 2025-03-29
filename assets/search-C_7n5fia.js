import { H as Header, $, c as createElement, M as MovieItemList, m as mountMovieItemList, s as showSkeleton, h as hideSkeleton, a as createMovieLoader, U as URLS } from "./createMovieLoader-C3aHVrRT.js";
function mountSearchTitle() {
  document.body.prepend(Header());
  const query = new URLSearchParams(window.location.search).get("query");
  $("#description").textContent = `"${query}" 검색 결과`;
}
function Fallback() {
  const $div = createElement("div", {
    className: "fallback-div",
    id: "fallback-div"
  });
  $div.innerHTML = `
      <img src="./images/fallback_no_movies.png" alt="머리 아픈 행성이" />
      <h1 class="title">검색 결과가 없습니다.</h1>
  `;
  return $div;
}
const movieItemList = MovieItemList();
let observer;
async function initSearchApp() {
  const query = getSearchParams("query");
  const loader = createMovieLoader(URLS.searchMovieUrl, query);
  registerObserver({ loader });
  mountIndexPageUI();
  await loadAndDisplayMovies({ loader });
}
function getSearchParams(key) {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}
function registerObserver({ loader }) {
  observer = new IntersectionObserver(async ([entry]) => {
    if (entry.isIntersecting) {
      await loadAndDisplayMovies({ loader });
    }
  });
  const sentinel = $("#sentinel");
  if (sentinel) {
    observer.observe(sentinel);
  }
}
async function loadAndDisplayMovies({ loader }) {
  try {
    showSkeleton();
    const { results, isLastPage } = await loader();
    hideSkeleton();
    if (isLastPage && observer) {
      observer.disconnect();
    }
    movieItemList.render(results);
  } catch {
    showFallback();
  }
}
function showFallback() {
  var _a;
  (_a = $("#thumbnail-container")) == null ? void 0 : _a.replaceChildren(Fallback());
}
function mountIndexPageUI() {
  mountSearchTitle();
  mountMovieItemList(movieItemList);
}
initSearchApp();
