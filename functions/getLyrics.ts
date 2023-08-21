import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import cheerio from "cheerio";
import yt from 'youtube-dl-exec'


export async function getLyrics(song: string): Promise<any | undefined> {
  try {
    const config: AxiosRequestConfig = {
      baseURL: `https://lyricstranslate.com/fa/ajax/lyricstranslategoogleautocomplete/autocomplete?query=${song}`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const getDataLyrics = await axios(config)
    return getDataLyrics
  } catch (error) {
    console.error(error);
  }
}

export async function extactLyrics(url: string): Promise<any | undefined> {
  try {
    const config: AxiosRequestConfig = {
      baseURL: `https://lyricstranslate.com/${url}`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const data: any = await axios(config);
    const $ = cheerio.load(data.data);
    const textLyric: string | undefined = $('#song-body').text();
    const urlMusic: string | undefined = $('.lty-playbtn').attr('href')
    const musicData = await yt(`${urlMusic}`, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    })
    
    const bestAudioFormat: object = musicData.formats
      .filter((format) => {
        if (
          format.filesize &&
          format.filesize !== null &&
          format.ext !== "none" &&
          format.ext == "m4a"
        ) {
          return true;
        }
        return false;
      })
      .sort((a, b) => b.filesize - a.filesize)[0];
      
      const videoWithAudio: [] | object = musicData.formats.filter((item) => {
        if ((item as any).acodec !== 'none' && (item as any).vcodec !== 'none') {
          return true;
        }
        return false;
      })
      console.log(videoWithAudio);

    let lastHouseWithDimensions: string | null | undefined | object = null;
    for (let i = 0; i < musicData.thumbnails.length; i++) {
      const thumbnail = musicData.thumbnails[i];
      if (thumbnail.height && thumbnail.width && thumbnail.url.includes('.jpg')) {
        lastHouseWithDimensions = thumbnail;
      }

    }
    return { textLyric, bestAudioFormat, lastHouseWithDimensions, musicData, videoWithAudio }
  } catch (error) {
    console.error(error);
  }
}