/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import { promises as fs } from 'fs';
import path from 'path';
import { useEffect, useState } from 'react';

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
};

function audioVolumeIn(q, ms) {
  var InT = 0;
  var setVolume = 1.0; // Target volume level for new song
  var speed = setVolume / (ms / 10); // Rate of increase
  q.volume = InT;
  var eAudio = setInterval(function () {
    InT += speed;
    q.volume = InT.clamp(0, 1);
    console.log('Fade In: ' + q.volume);
    if (InT >= setVolume) {
      clearInterval(eAudio);
    }
  }, 10);
}

function audioVolumeOut(q, ms) {
  var InT = q.volume;
  var setVolume = 0; // Target volume level for old song
  var speed = InT / (ms / 10); // Rate of volume decrease
  q.volume = InT;
  var fAudio = setInterval(function () {
    InT -= speed;
    q.volume = InT.clamp(0, 1);
    console.log('Fade Out: ' + q.volume);
    if (InT <= setVolume) {
      clearInterval(fAudio);
    }
  }, 10);
}

export default function Home({ songs }) {
  const [currSongName, setCurrSongName] = useState('');
  const [songDone, setSongDone] = useState(true);
  useEffect(() => {
    (async () => {
      if (songDone) {
        setSongDone(false);
        const song = songs.random();
        setCurrSongName(song.name);
        const audio = new Audio(song.url);
        audio.volume = 0;
        const audioFadeTime = 15;
        audio.onloadedmetadata = () => {
          audio.currentTime = audio.duration - 50;
          setTimeout(() => {
            audioVolumeOut(audio, audioFadeTime * 1000);
            setSongDone(true);
          }, (audio.duration - audio.currentTime - audioFadeTime) * 1000);
        };
        await audio.play();
        audioVolumeIn(audio, audioFadeTime * 1000);
      }
    })();
  }, [songDone, songs]);
  return (
    <div className="main">
      <video playsInline autoPlay muted loop className="bg">
        <source src="girl.mp4" type="video/mp4" />
        <source src="girl.webm" type="video/webm" />
      </video>
      <div className="title">{currSongName}</div>
      <div className="socials_wrapper">
        <img
          src="https://www.freepnglogos.com/uploads/spotify-logo-png/file-spotify-logo-png-4.png"
          alt=""
          className="social_pic"
          layout="fill"
        />
        <div className="social_text">
          <div className="social_title">Listen on Spotify</div>
          <div className="social_subtitle">Link in description</div>
        </div>
      </div>
    </div>
  );
}
export async function getStaticProps(context) {
  const songsDir = path.join(process.cwd(), 'public', 'songs');
  const filenames = await fs.readdir(songsDir);
  const songs = filenames
    .filter((n) => n.endsWith('mp3'))
    .map((filename) => {
      const filePath = path.join(songsDir, filename);

      return {
        name: filename.replace(/-[^\. ]+\.mp3/, ''),
        url: path.join('songs', filename),
      };
    });
  return {
    props: { songs }, // will be passed to the page component as props
  };
}
