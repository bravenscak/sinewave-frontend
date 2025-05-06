import React from 'react';

const LandingPage = () => {
  const navItems = ["Register", "Login", "MyPlaylists", "MySongs", "ProfileDetails", "UploadSong"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-black text-white">
      <nav className="flex items-center justify-between px-8 py-6 bg-black bg-opacity-30 backdrop-blur-md">
        <h1 className="text-3xl font-bold tracking-widest text-white">SINEWAVE</h1>
        <ul className="flex space-x-6 text-lg font-medium">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`${item.toLowerCase()}`}
                className="hover:text-indigo-300 transition"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <section>
          <img alt="" src='../img/5af4b12d-098e-4050-9de0-44cc5855d855.png'/>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;