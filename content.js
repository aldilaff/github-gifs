async function fetchHTML(url) {
  const response = await fetch(url);
  return await response.text();
}

async function fetchJSON(url) {
  const response = await fetch(url);
  return await response.json();
}

async function showPopup(nearElement) {
  const popupHTML = await fetchHTML(chrome.runtime.getURL("popup.html"));
  const popup = document.createElement("div");
  popup.className = "gif-popup";
  popup.innerHTML = popupHTML;

  const { bottom, left } = nearElement.getBoundingClientRect();
  Object.assign(popup.style, {
    position: "absolute",
    top: `${bottom + window.scrollY}px`,
    left: `${left}px`,
    zIndex: "10000"
  });

  document.body.appendChild(popup);

  const removePopup = (event) => {
    if (!popup.contains(event.target) && event.target !== nearElement) {
      popup.remove();
      document.removeEventListener("click", removePopup);
    }
  };

  document.addEventListener("click", removePopup, true);

  setupSearchHandlers(popup, nearElement);
}

function setupSearchHandlers(popup, nearElement) {
  const searchButton = popup.querySelector("#searchButton");
  const searchInput = popup.querySelector("#searchInput");
  const resultsDiv = popup.querySelector("#results");

  searchButton.addEventListener("click", async () => {
    const query = searchInput.value;
    const url = `https://github-gifs.aldilaff6545.workers.dev?q=${query}`;
    const { data } = await fetchJSON(url);

    resultsDiv.innerHTML = "";
    data.forEach(({ images }) => appendGif(images.fixed_height.url, nearElement, resultsDiv));
  });
}

function appendGif(src, nearElement, parentDiv) {
  const img = document.createElement("img");
  img.src = src;
  img.addEventListener("click", () => {
    const commentBox = nearElement.closest("tab-container").querySelector("textarea");
    commentBox.value += `![gif](${src})`;
    parentDiv.parentElement.remove();
  });
  parentDiv.appendChild(img);
}

function addGifButton() {
  const commentBoxes = document.querySelectorAll("markdown-toolbar");
  const iconURL = chrome.runtime.getURL("gif-icon.png");

  commentBoxes.forEach((box) => {
    if (!box.parentElement.querySelector(".gif-button")) {
      const gifButton = document.createElement("div");
      gifButton.className = "gif-button";
      gifButton.innerHTML = `<img src="${iconURL}" class="gif-icon">`;
      gifButton.addEventListener("click", (e) => {
        e.preventDefault();
        showPopup(gifButton);
      });
      box.prepend(gifButton);
    }
  });
}

function addStyles() {
  const style = document.createElement("style");
  style.textContent = `
.gif-popup {
    position: absolute;
    background-color: #fff;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e4e8;
    z-index: 10000;
    overflow: auto;
    max-height: 400px;
    max-width: 400px; /* or whatever maximum you desire */
    min-width: 150px; /* or any suitable minimum width */
}

.gif-popup img {
    max-width: 100%;
    height: auto;
}

.gif-popup pre, .gif-popup code {
    white-space: break-spaces; /* Wraps text and prevents overflow */
    word-wrap: break-word; /* Older browsers */
}

        /* Optional: Add more specific styles, such as for buttons, images, or text within the popup */
        .gif-popup button {
            background-color: #2ea44f; /* GitHub's green color */
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }

        .gif-popup button:hover {
            background-color: #22863a; /* Darker green for hover effect */
        }
        .gif-icon{
            width: 24px;
    height: 24px;
        }
        .gif-button{
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

const observer = new MutationObserver(addGifButton);
observer.observe(document.body, { childList: true, subtree: true });

addGifButton();
addStyles();
