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
      path: "./search.html",
      query: { query: searchValue }
    });
  });
  $logo.addEventListener("click", () => {
    redirectWithQuery({
      path: "./index.html"
    });
  });
  $searchButton.appendChild($searchImg);
  $form.append($input, $searchButton);
  $logo.appendChild($logoImg);
  $header.append($logo, $form);
  $headerContainer.appendChild($header);
  return $headerContainer;
}
function $(element) {
  return document.querySelector(element);
}
function mountMovieItemList(movieItemList) {
  const $container = $("#thumbnail-container");
  $container == null ? void 0 : $container.insertBefore(
    movieItemList.$el,
    $container.querySelector(".skeleton-list")
  );
}
const URLS = {
  popularMovieUrl: "https://api.themoviedb.org/3/movie/popular",
  searchMovieUrl: "https://api.themoviedb.org/3/search/movie",
  detailMovieUrl: "https://api.themoviedb.org/3/movie/"
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
function showElement(element) {
  element == null ? void 0 : element.classList.remove("hide");
}
function hideElement(element) {
  element == null ? void 0 : element.classList.add("hide");
}
function Modal($modalElement) {
  const $modal = createModal($modalElement);
  bindCloseEvent($modal);
  render($modal);
}
function createModal($modalElement) {
  const $modalBackground = createElement("div", {
    className: ["modal-background", "active"],
    id: "modalBackground"
  });
  const $modal = createElement("div", {
    className: "modal"
  });
  const $closeButton = createElement("button", {
    className: "close-modal",
    id: "closeModal"
  });
  const $closeImg = createElement("img", {
    src: "./images/modal_button_close.png"
  });
  $closeButton.append($closeImg);
  $modal.append($closeButton, $modalElement);
  $modalBackground.append($modal);
  return $modalBackground;
}
function render($modal) {
  $("#wrap").append($modal);
}
function bindCloseEvent($modal) {
  const $closeButton = $modal.querySelector("#closeModal");
  $modal.addEventListener("click", (e) => {
    if (e.target.id === "modalBackground") close($modal);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close($modal);
  });
  $closeButton.addEventListener("click", () => close($modal));
}
function close($modal) {
  $modal.remove();
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
function updateRating({ id, rating }) {
  const storedData = localStorage.getItem("MovieData");
  const movieList = storedData ? JSON.parse(storedData) : [];
  const isExisting = movieList.some((movie) => movie.id === id);
  const updatedList = isExisting ? movieList.map((movie) => movie.id === id ? { id, rating } : movie) : [...movieList, { id, rating }];
  localStorage.setItem("MovieData", JSON.stringify(updatedList));
}
function getRating(id) {
  const storedData = localStorage.getItem("MovieData");
  if (!storedData) return 0;
  const movieList = JSON.parse(storedData);
  const movie = movieList.find((movie2) => movie2.id === id);
  return movie ? Number(movie.rating) : 0;
}
function getYear(date) {
  return date.slice(0, 4);
}
function getGenre(genres) {
  return genres.map((genre) => genre.name);
}
const messages = {
  0: "별점을 메겨주세요",
  2: "최악이에요",
  4: "별로예요",
  6: "보통이에요",
  8: "재미있어요",
  10: "명작이에요"
};
function setupRatingStars($modalContainer, id) {
  const $stars = Array.from($modalContainer.querySelectorAll(".estimate-star"));
  const $description = $modalContainer.querySelector(
    ".estimate-description .modal-text"
  );
  const $score = $modalContainer.querySelector(".estimate-number");
  const initialRating = getRating(id);
  const selectedStartIndex = initialRating / 2;
  renderInitialStars($stars, selectedStartIndex);
  updateText($description, $score, initialRating);
  bindStarClickEvents($stars, $description, $score, id);
}
function renderInitialStars(stars, selectedStartIndex) {
  stars.forEach((star, index) => {
    star.src = index < selectedStartIndex ? "./images/star_filled.png" : "./images/star_empty.png";
  });
}
function updateText($description, $score, rating) {
  if ($description) $description.textContent = messages[rating];
  if ($score) $score.textContent = `(${rating}/10)`;
}
function bindStarClickEvents(stars, $description, $score, id) {
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      const selectedStartIndex = index + 1;
      const rating = selectedStartIndex * 2;
      renderInitialStars(stars, selectedStartIndex);
      updateText($description, $score, rating);
      updateRating({ id, rating });
    });
  });
}
function DetailModal({
  id,
  poster_path,
  title,
  overview,
  vote_average,
  genres,
  release_date
}) {
  const $modalContainer = createElement("div", {
    className: "modal-container"
  });
  const year = getYear(release_date);
  const genre = getGenre(genres).join(", ");
  $modalContainer.innerHTML = `
        <div class="modal-image">
            <img src="https://image.tmdb.org/t/p/w500/${poster_path}" alt="${title}" />
        </div>
        <div class="modal-description">
            <h2 id="modal-title">${title}</h2>
            <p class="category">
              ${year} · ${genre}
            </p>
            <p class="rate">
              <span class="rate-text white">평균 </span>
                <img src="./images/star_filled.png" class="star" />
                <span>${vote_average}</span>
            </p>
            <hr/>
          <div class="modal-description-wrap">
            <div class="marginT1rem">
                <p class="modal-text">내 별점</p>
                <div class="estimate-wrap">
                    <div>
                        ${'<img src="./images/star_empty.png" class="estimate-star" />'.repeat(
    5
  )}
                    </div>
                    <div class=estimate-description>
                        <span class="modal-text"></span>
                        <span class="modal-text estimate-number">(0/10)</span>
                    </div>
                </div>
            </div>
            <hr />
            <p class="modal-text marginT1rem">줄거리</p>
            <p class="detail marginT1rem">
              ${overview}
            </p>
        </div>
        </div>`;
  setupRatingStars($modalContainer, id);
  return $modalContainer;
}
const Spinner = (scale) => {
  const $spinner = createElement("div", {
    className: "orbit-spinner",
    style: `scale: ${scale}`
  });
  $spinner.innerHTML = /*html*/
  `
  <div class="orbit-spinner" style="scale: ${scale}">
      <div class="planet"></div>
      <div class="orbit">
        <div class="satellite satellite-1"></div>
        <div class="satellite satellite-2"></div>
      </div>
    </div>
  `;
  return $spinner;
};
function replaceModalContent($newContent) {
  const $modal = document.querySelector(".modal");
  if (!$modal) return;
  const $closeButton = $modal.querySelector("#closeModal");
  $modal.innerHTML = "";
  if ($closeButton) $modal.appendChild($closeButton);
  $modal.appendChild($newContent);
}
function MovieItem({ src, title, rate, id }) {
  const $li = createElement("li");
  let url = `https://image.tmdb.org/t/p/w500/${src}`;
  if (!src) url = "images/fallback.png";
  $li.innerHTML = `
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
    `;
  $li.addEventListener("click", () => handleMovieClick({ id }));
  return $li;
}
async function handleMovieClick({ id }) {
  Modal(Spinner());
  const data = await fetchUrl(
    `${URLS.detailMovieUrl}${id}`,
    defaultQueryObject,
    defaultOptions
  );
  const $detailModal = DetailModal({ ...data });
  replaceModalContent($detailModal);
}
function MovieItemList() {
  const $ul = createElement("ul", {
    className: "thumbnail-list",
    id: "thumbnail-list"
  });
  function render2(movieData) {
    const $fragment = document.createDocumentFragment();
    movieData.forEach((movie) => {
      const { title, poster_path, vote_average, id } = movie;
      const movieItem = MovieItem({
        title,
        src: poster_path,
        rate: vote_average,
        id
      });
      $fragment.appendChild(movieItem);
    });
    $ul.appendChild($fragment);
  }
  return {
    $el: $ul,
    render: render2
  };
}
const $skeletonList = document.querySelector(".skeleton-list");
function hideSkeleton() {
  hideElement($skeletonList);
}
function showSkeleton() {
  showElement($skeletonList);
}
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
function createMovieLoader(url, searchTerm) {
  let page = 1;
  return async () => {
    const newQueryObject = searchTerm ? { query: searchTerm, ...defaultQueryObject, page: String(page) } : { ...defaultQueryObject, page: String(page) };
    let response = null;
    try {
      response = await fetchUrl(
        url,
        newQueryObject,
        defaultOptions
      );
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
export {
  $,
  Header as H,
  MovieItemList as M,
  URLS as U,
  createMovieLoader as a,
  createElement as c,
  hideSkeleton as h,
  mountMovieItemList as m,
  showSkeleton as s
};
