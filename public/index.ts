const searchElement = document.querySelector<HTMLInputElement>('#searchInput');
const resultsContainer = document.querySelector<HTMLDivElement>('#resultsContainer')!;
const loadingIndicator = document.querySelector<HTMLDivElement>('#loadingIndicator')!;

interface LyricsData {
  data: LyricsItem[];
}

interface LyricsItem {
  value: string;
  data: {
    category: string;
    url: string;
  };
}

if (loadingIndicator !== null) {
  loadingIndicator.style.display = 'none';
}
if (resultsContainer !== null) {
  resultsContainer.innerHTML = '';
}

searchElement?.addEventListener('input', (e: Event) => {
  const inputValue: string | undefined = (e.target as HTMLInputElement)?.value;

  if (resultsContainer !== null) {
    resultsContainer.innerHTML = '';
  }

  if (inputValue) {
    const hasFarsiCharacters: boolean = /[\u0600-\u06FF]/.test(inputValue);
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
      .then((response: Response) => response.json())
      .then((data: LyricsData) => {        
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
        data.data.forEach((item: LyricsItem) => {
          const songName: string = `${item.value}`;
          const section: HTMLElement = document.createElement('section');

          const songElement: HTMLElement = document.createElement('p');
          songElement.textContent = songName;
          songElement.className = 'url-path'
          songElement.setAttribute('data-url', item.data.url)

          section.appendChild(songElement);
          resultsContainer.appendChild(section);
          loadingIndicator.style.display = 'none';

          if (inputValue === undefined || inputValue == '') {
            resultsContainer.innerHTML = '';
            loadingIndicator.style.display = 'none';
          }
        });
      })
      .catch((error: any) => {
        loadingIndicator.style.display = 'none';
        console.error('Error:', error);
      });
  } else {
    resultsContainer.innerHTML = '';
  }
});


resultsContainer.addEventListener('click', (e: Event) => {
  if ((e.target as Element)?.matches('.url-path')) {
    const url = (e.target as HTMLElement)?.getAttribute('data-url');
    if (url !== null) {
      showUrlInformation(url);
    }
  }
});

function showUrlInformation(url: string): void {
  resultsContainer.innerHTML = '';

  if (url) {
    loadingIndicator.style.display = 'block';

    fetch(`/lyrics?query=${encodeURIComponent(url)}`)
      .then((response: Response) => response.json())
      .then((data: any) => {        
        if (!data.data || Object.keys(data.data).length === 0 || data.data === null) {
          resultsContainer.innerHTML = "<h1 class='not-response'>Not Found Music</h1>";
          if (loadingIndicator !== null) {
            loadingIndicator.style.display = 'none';
          }
          return;
        }
        
        const replacedText: string = data.data.textLyric.replace(/\n/g, "<br>");
        const mainAudio: HTMLElement | null = document.querySelector('#main-audio');
        const section: HTMLElement = document.createElement('section');
        const songText: HTMLElement = document.createElement('p');
        const title: HTMLElement = document.createElement('h3');
        const video: HTMLElement = document.createElement('article');

        title.className = 'title-song';
        title.textContent = data.data.musicData.fulltitle;

        video.className = 'video';

        if (video) {
          const lastVideoWithAudio: string | undefined = data.data.videoWithAudio ? data.data.videoWithAudio[data.data.videoWithAudio.length - 1].url : undefined;
          
          video.innerHTML = `<video id="player" playsinline controls data-poster="${data.data.lastHouseWithDimensions.url}">
          <source src="${lastVideoWithAudio}" type="video/mp4" />
          </video>`
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
      .catch((error: any) => {
        console.error('Error:', error);
        loadingIndicator.style.display = 'none';
      });
  } else {
    resultsContainer.innerHTML = '';
  }
}

function isFarsiText(text: string): boolean {
  const persianRegex = /[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F]+/;
  return persianRegex.test(text);
}

