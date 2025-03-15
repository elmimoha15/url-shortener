'use client';

import { useState } from 'react';

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl) return;

    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      const res = await fetch('http://127.0.0.1:8000/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: originalUrl }),
      });

      if (!res.ok) {
        throw new Error('Failed to shorten URL');
      }

      const data = await res.json();
      setShortUrl(data.short_url);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-200 text-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between w-full px-6 py-4">
        <div className="text-2xl font-bold text-blue-700">URLShort</div>
        <a
          href="https://github.com/your-username"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition font-medium"
        >
          GitHub
        </a>
      </nav>

      {/* Hero + Form */}
      <div className="flex-1 flex items-center justify-center px-4 mt-[-40px]">
        <div className="max-w-3xl w-full text-center space-y-8 bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/40">
          <h1 className="text-5xl font-bold">
            Welcome to <span className="text-blue-600">URLShort</span>
          </h1>
          <p className="text-gray-700 text-lg">
            Paste your long URL below and get a short, easy-to-share link instantly.
          </p>

          <form
            className="flex flex-col sm:flex-row items-center gap-4 w-full"
            onSubmit={handleSubmit}
          >
            <input
              type="url"
              placeholder="Enter your long URL here..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
              disabled={loading}
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>

          {/* Error message */}
          {error && <div className="text-red-600">{error}</div>}

          {/* Show real short URL */}
          {shortUrl && (
            <div className="text-blue-700 text-lg font-medium mt-4">
              Shortened URL:{' '}
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {shortUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
