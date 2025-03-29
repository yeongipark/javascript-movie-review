import { c as createElement, $, H as Header, M as MovieItemList, m as mountMovieItemList, s as showSkeleton, h as hideSkeleton, a as createMovieLoader, U as URLS } from "./createMovieLoader-BdezxUbn.js";
function Hero() {
  const backgroundHero = createElement("div", {
    id: "hero",
    className: "background-container"
  });
  backgroundHero.innerHTML = `

    <div class="overlay" aria-hidden="true" ></div>
       <div class="top-rated-container">
            <div class="top-rated-movie">
               <div class="rate">
                 <img src="./images/star_empty.png" class="star" />
                 <span class="rate-value">9.5</span>
               </div>
               <div class="title">인사이드 아웃2</div>
              <button class="primary detail">자세히 보기</button>
             </div>
  </div>
`;
  return backgroundHero;
}
function mountHeader() {
  const $wrap = $("#wrap");
  $wrap == null ? void 0 : $wrap.prepend(Header());
}
function mountHero() {
  const $wrap = $("#wrap");
  $wrap == null ? void 0 : $wrap.prepend(Hero());
}
const movieItemList = MovieItemList();
let observer;
async function initIndexApp() {
  const loader = createMovieLoader(URLS.popularMovieUrl);
  mountIndexPageUI();
  await loadAndDisplayMovies({ loader });
  registerObserver({ loader });
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
  showSkeleton();
  const { results, isLastPage } = await loader();
  hideSkeleton();
  if (isLastPage && observer) {
    const sentinel = $("#sentinel");
    if (sentinel) observer.unobserve(sentinel);
    observer.disconnect();
  }
  movieItemList.render(results);
}
function mountIndexPageUI() {
  mountHeader();
  mountHero();
  mountMovieItemList(movieItemList);
}
initIndexApp();
