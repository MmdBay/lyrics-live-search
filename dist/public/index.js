"use strict";
const searchElement = document.querySelector('#searchInput');
const resultsContainer = document.querySelector('#resultsContainer');
const loadingIndicator = document.querySelector('#loadingIndicator');
if (loadingIndicator !== null) {
    loadingIndicator.style.display = 'none';
}
if (resultsContainer !== null) {
    resultsContainer.innerHTML = '';
}
searchElement === null || searchElement === void 0 ? void 0 : searchElement.addEventListener('input', (e) => {
    var _a;
    const inputValue = (_a = e.target) === null || _a === void 0 ? void 0 : _a.value;
    if (resultsContainer !== null) {
        resultsContainer.innerHTML = '';
    }
    if (inputValue) {
        const hasFarsiCharacters = /[\u0600-\u06FF]/.test(inputValue);
        if (searchElement !== null) {
            searchElement.dir = hasFarsiCharacters ? 'rtl' : 'ltr';
        }
        if (searchElement !== null) {
            searchElement.placeholder = hasFarsiCharacters ? 'دنبال چی میگردی؟' : 'What Are You Looking For?';
        }
        if (loadingIndicator !== null) {
            loadingIndicator.style.display = 'block';
        }
        fetch(`/search?query=${encodeURIComponent(inputValue)}`)
            .then((response) => response.json())
            .then((data) => {
            if (resultsContainer !== null) {
                resultsContainer.innerHTML = '';
            }
            if (!data.data || Object.keys(data.data).length === 0 || data.data === null) {
                resultsContainer.innerHTML = "<h1 class='not-response'>Not Found Music</h1>";
                if (loadingIndicator !== null) {
                    loadingIndicator.style.display = 'none';
                }
                return;
            }
            data.data.forEach((item) => {
                const songName = `${item.value}`;
                const section = document.createElement('section');
                const songElement = document.createElement('p');
                songElement.textContent = songName;
                songElement.className = 'url-path';
                songElement.setAttribute('data-url', item.data.url);
                section.appendChild(songElement);
                resultsContainer.appendChild(section);
                loadingIndicator.style.display = 'none';
                if (inputValue === undefined || inputValue == '') {
                    resultsContainer.innerHTML = '';
                    loadingIndicator.style.display = 'none';
                }
            });
        })
            .catch((error) => {
            loadingIndicator.style.display = 'none';
            console.error('Error:', error);
        });
    }
    else {
        resultsContainer.innerHTML = '';
    }
});
resultsContainer.addEventListener('click', (e) => {
    var _a, _b;
    if ((_a = e.target) === null || _a === void 0 ? void 0 : _a.matches('.url-path')) {
        const url = (_b = e.target) === null || _b === void 0 ? void 0 : _b.getAttribute('data-url');
        if (url !== null) {
            showUrlInformation(url);
        }
    }
});
function showUrlInformation(url) {
    resultsContainer.innerHTML = '';
    if (url) {
        loadingIndicator.style.display = 'block';
        fetch(`/lyrics?query=${encodeURIComponent(url)}`)
            .then((response) => response.json())
            .then((data) => {
            if (!data.data || Object.keys(data.data).length === 0 || data.data === null) {
                resultsContainer.innerHTML = "<h1 class='not-response'>Not Found Music</h1>";
                if (loadingIndicator !== null) {
                    loadingIndicator.style.display = 'none';
                }
                return;
            }
            const replacedText = data.data.textLyric.replace(/\n/g, "<br>");
            const mainAudio = document.querySelector('#main-audio');
            const section = document.createElement('section');
            const songText = document.createElement('p');
            const title = document.createElement('h3');
            const video = document.createElement('article');
            title.className = 'title-song';
            title.textContent = data.data.musicData.fulltitle;
            video.className = 'video';
            if (video) {
                const lastVideoWithAudio = data.data.videoWithAudio ? data.data.videoWithAudio[data.data.videoWithAudio.length - 1].url : undefined;
                video.innerHTML = `<video id="player" playsinline controls data-poster="${data.data.lastHouseWithDimensions.url}">
          <source src="${lastVideoWithAudio}" type="video/mp4" />
          </video>`;
            }
            resultsContainer.appendChild(title);
            resultsContainer.appendChild(video);
            if (mainAudio) {
                mainAudio.innerHTML = `<audio id="player" controls>
            <source src="${data.data.bestAudioFormat.url}" type="audio/mp3" />
          </audio>`;
            }
            songText.className = 'song-text';
            songText.innerHTML = replacedText;
            section.setAttribute("dir", isFarsiText(data.data.textLyric) ? "rtl" : "ltr");
            section.appendChild(songText);
            resultsContainer.appendChild(section);
            loadingIndicator.style.display = 'none';
        })
            .catch((error) => {
            console.error('Error:', error);
            loadingIndicator.style.display = 'none';
        });
    }
    else {
        resultsContainer.innerHTML = '';
    }
}
function isFarsiText(text) {
    const persianRegex = /[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F]+/;
    return persianRegex.test(text);
}
