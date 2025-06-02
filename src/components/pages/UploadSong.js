import React, { useState } from 'react';
import { fetchWithAuth, getCurrentUser, logout } from '../../utils/AuthUtils';
import '../css/UploadSong.css';

const UploadSong = () => {
  const [message, setMessage] = useState('Drag the mp3 file into the box...');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePaste = async (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const items = clipboardData.items;

    if (!items.length) {
      setMessage('Nothing to paste.');
      return;
    }

    for (let item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        setMessage(`Uploading file: ${file.name}`);

        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('http://localhost:8081/upload', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            setMessage(`Uploaded: ${file.name}`);
          } else {
            setMessage(`Upload failed: ${res.statusText}`);
          }
        } catch (err) {
          setMessage(`Error: ${err.message}`);
        }
      }
    }
  };

  return (
    <div
      onPaste={handlePaste}
      tabIndex={0}
      className="border-2 border-dashed border-blue-400 rounded-xl p-6 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ minHeight: '150px', cursor: 'text' }}
    >
      {message}
      <p className="text-sm text-gray-500 mt-2">(Click here and paste an image or text)</p>
    </div>
  );
}

export default UploadSong;
