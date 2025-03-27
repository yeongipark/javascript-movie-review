(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function createElement(tag, props) {
  const element = document.createElement(tag);
  const resolvedProps = props ?? {};
  Object.entries(resolvedProps).forEach(([key, value]) => {
    if (key === "className") {
      if (Array.isArray(value)) {
        element.classList.add(...value);
      } else if (typeof value === "string") {
        element.classList.add(value);
      }
      return;
    }
    if (key in element) element[key] = value;
  });
  return element;
}
function redirectWithQuery({
  path,
  query
}) {
  const queryString = new URLSearchParams(query).toString();
  window.location.href = `${path}?${queryString}`;
}
function Header() {
  const $headerContainer = createElement("div", {
    className: "header-container"
  });
  const $header = createElement("header", { className: "header" });
  const $logo = createElement("h1", { className: "logo" });
  const $logoImg = createElement("img", {
    src: "./images/logo.png",
    alt: "MovieList"
  });
  const $form = createElement("form", {
    className: "input-form"
  });
  const $searchButton = createElement("button", {
    className: "search-btn"
  });
  const $searchImg = createElement("img", {
    src: "./images/Search.png",
    alt: "돋보기"
  });
  const $input = createElement("input", {
    type: "text",
    name: "search-bar",
    className: "search-bar",
    placeholder: "검색어를 입력하세요"
  });
  $form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchValue = formData.get("search-bar");
    redirectWithQuery({
      path: "/search.html",
      query: { query: searchValue }
    });
  });
  $logo.addEventListener("click", () => {
    redirectWithQuery({
      path: "/index.html"
    });
  });
  $searchButton.appendChild($searchImg);
  $form.append($input, $searchButton);
  $logo.appendChild($logoImg);
  $header.append($logo, $form);
  $headerContainer.appendChild($header);
  return $headerContainer;
}
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
function $(element) {
  return document.querySelector(element);
}
function mountHeader() {
  const $wrap = $("#wrap");
  $wrap == null ? void 0 : $wrap.prepend(Header());
}
function mountMovieItemList(movieItemList2) {
  const $container = $("#thumbnail-container");
  $container == null ? void 0 : $container.insertBefore(
    movieItemList2.$el,
    $container.querySelector(".skeleton-list")
  );
}
function mountLoadMoreButton(loadMoreButton2) {
  const $container = $("#thumbnail-container");
  $container == null ? void 0 : $container.append(loadMoreButton2.$el);
}
const ERROR_MESSAGE = {
  FETCH_ERROR: "API 서버 상태가 좋지 않아 데이터를 가져오는데 실패했습니다.",
  NO_DATA: "검색 값을 찾지 못했어요."
};
async function fetchUrl(url, queryObject, options = {}) {
  const queryString = new URLSearchParams(queryObject).toString();
  const finalUrl = queryString ? `${url}?${queryString}` : url;
  const response = await fetch(finalUrl, options);
  if (!response.ok || !navigator.onLine)
    throw new Error(ERROR_MESSAGE.FETCH_ERROR);
  const data = await response.json();
  return data;
}
const URLS = {
  popularMovieUrl: "https://api.themoviedb.org/3/movie/popular"
};
const defaultOptions = {
  headers: {
    Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYjk4ZTJmOTc0MDk1YjI4ZmJkZmJiYmMwOGE2NmUyNiIsIm5iZiI6MTcxNzIyNjk4NS45NCwic3ViIjoiNjY1YWNkZTkxMzM0YmUxM2Y4NDdkMjBjIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.0aAiLDM1xSqolrGLvKC8S8smYMxBYkNxItpHl63dHDo"}`
  }
};
const defaultQueryObject = {
  language: "ko-KR",
  include_adult: String(false)
};
const TOTAL_PAGE = 500;
const Toast = {
  showToast(message, type = "error", duration = 5e3) {
    if (type === "info") duration = 2e3;
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    if (type == "error") message = message.replace("[ERROR]", "");
    toast.innerHTML = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
    toast.addEventListener("click", () => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    });
  },
  resetToast() {
    let toastContainer = document.querySelector(".toast-container");
    if (toastContainer) toastContainer.remove();
  }
};
function createMovieLoader(url, queryObject, options, searchTerm) {
  let page = 1;
  return async () => {
    const newQueryObject = { ...queryObject, page: String(page) };
    let response = null;
    try {
      response = await fetchUrl(url, newQueryObject, options);
    } catch (error) {
      if (error instanceof Error) {
        Toast.showToast(error.message, "error", 5e3);
      }
      return { results: [], isLastPage: true };
    }
    if (!response || !response.results)
      throw new Error(ERROR_MESSAGE.FETCH_ERROR);
    if (response.results.length === 0) throw new Error(ERROR_MESSAGE.NO_DATA);
    const { results, total_pages } = response;
    const pageLimit = Math.min(TOTAL_PAGE, total_pages);
    page++;
    return { results, isLastPage: page > pageLimit };
  };
}
function showElement(element) {
  element == null ? void 0 : element.classList.remove("hide");
}
function hideElement(element) {
  element == null ? void 0 : element.classList.add("hide");
}
const $skeletonList = document.querySelector(".skeleton-list");
function hideSkeleton() {
  hideElement($skeletonList);
}
function showSkeleton() {
  showElement($skeletonList);
}
async function loadMovies(loader, movieItemList2, loadMoreButton2) {
  showSkeleton();
  const { results, isLastPage } = await loader();
  hideSkeleton();
  if (isLastPage) loadMoreButton2.hide();
  movieItemList2.render(results);
}
function MovieItem({ src, title, rate }) {
  const $li = createElement("li");
  let url = `https://image.tmdb.org/t/p/w500/${src}`;
  if (!src) url = "images/fallback.png";
  $li.innerHTML = `
    <li>
        <div class="item">
            <img
            class="thumbnail"
            src='${url}'
            alt=${title}
            />
            <div class="item-desc">
            <p class="rate">
                <img src="./images/star_empty.png" class="star" />
                <span>${rate}</span>
            </p>
            <strong>${title}</strong>
            </div>
        </div>
    </li>
    `;
  return $li;
}
function MovieItemList() {
  const $ul = createElement("ul", {
    className: "thumbnail-list",
    id: "thumbnail-list"
  });
  function render(movieData) {
    const $fragment = document.createDocumentFragment();
    movieData.forEach((movie) => {
      const { title, poster_path, vote_average } = movie;
      const movieItem = MovieItem({
        title,
        src: poster_path,
        rate: vote_average
      });
      $fragment.appendChild(movieItem);
    });
    $ul.appendChild($fragment);
  }
  return {
    $el: $ul,
    render
  };
}
function Button({ className, placeholder, onClick, id }) {
  const $button = createElement("button", { className, id });
  $button.textContent = placeholder;
  $button.addEventListener("click", onClick);
  return $button;
}
function LongButton(text, load) {
  const $longButton = Button({
    className: ["primary", "width-100"],
    placeholder: text,
    id: "load-more",
    onClick: load
  });
  function setOnClick(onClick) {
    $longButton.onclick = onClick;
  }
  function hide() {
    hideElement($longButton);
  }
  return { $el: $longButton, setOnClick, hide };
}
function mountHero() {
  const $wrap = $("#wrap");
  $wrap == null ? void 0 : $wrap.prepend(Hero());
}
const movieItemList = MovieItemList();
const loadMoreButton = LongButton("더보기");
function initIndexApp() {
  mountHeader();
  mountHero();
  mountMovieItemList(movieItemList);
  mountLoadMoreButton(loadMoreButton);
  const loader = createMovieLoader(
    URLS.popularMovieUrl,
    defaultQueryObject,
    defaultOptions
  );
  const load = () => loadMovies(loader, movieItemList, loadMoreButton);
  loadMoreButton.setOnClick(load);
  load();
}
initIndexApp();
