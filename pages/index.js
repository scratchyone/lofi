/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import { promises as fs } from 'fs';
import path from 'path';
import { useEffect, useState } from 'react';

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

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
        audio.onended = () => setSongDone(true);
        await audio.play();
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
