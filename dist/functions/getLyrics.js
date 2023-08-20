"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extactLyrics = exports.getLyrics = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const youtube_dl_exec_1 = __importDefault(require("youtube-dl-exec"));
function getLyrics(song) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = {
                baseURL: `https://lyricstranslate.com/fa/ajax/lyricstranslategoogleautocomplete/autocomplete?query=${song}`,
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const getDataLyrics = yield (0, axios_1.default)(config);
            return getDataLyrics;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.getLyrics = getLyrics;
function extactLyrics(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = {
                baseURL: `https://lyricstranslate.com/${url}`,
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const data = yield (0, axios_1.default)(config);
            const $ = cheerio_1.default.load(data.data);
            const textLyric = $('#song-body').text();
            const urlMusic = $('.lty-playbtn').attr('href');
            const musicData = yield (0, youtube_dl_exec_1.default)(`${urlMusic}`, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot']
            });
            const bestAudioFormat = musicData.formats
                .filter((format) => {
                if (format.filesize &&
                    format.filesize !== null &&
                    format.ext !== "none" &&
                    format.ext == "m4a") {
                    return true;
                }
                return false;
            })
                .sort((a, b) => b.filesize - a.filesize)[0];
            let lastHouseWithDimensions = null;
            for (let i = 0; i < musicData.thumbnails.length; i++) {
                const thumbnail = musicData.thumbnails[i];
                if (thumbnail.height && thumbnail.width && thumbnail.url.includes('.jpg')) {
                    lastHouseWithDimensions = thumbnail;
                }
            }
            return { textLyric, bestAudioFormat, lastHouseWithDimensions, musicData };
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.extactLyrics = extactLyrics;
