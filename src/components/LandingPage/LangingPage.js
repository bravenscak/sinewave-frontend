import React from 'react';

const LandingPage = () => {
  const navItems = ["Login", "MyPlaylists", "MySongs", "ProfileDetails", "UploadSong"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-black text-white">
      <nav className="flex items-center justify-between px-8 py-6 bg-black bg-opacity-30 backdrop-blur-md">
        <h1 className="text-3xl font-bold tracking-widest text-white">SINEWAVE</h1>
        <ul className="flex space-x-6 text-lg font-medium">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="hover:text-indigo-300 transition"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="flex flex-col items-center justify-center text-center py-32 px-6">
        <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
          Welcome to <span className="text-indigo-400">SINEWAVE</span>
        </h2>
        <p className="text-lg text-gray-300 max-w-xl">
          Mockup of the front page.
        </p>
        <a
          href="#Login"
          className="mt-8 px-6 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-400 transition"
        >
          Get Started
        </a>
      </section>
    </div>
  );
}

export default LandingPage;