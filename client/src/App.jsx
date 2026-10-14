import { useEffect, useState } from "react";

const savedToken = window.localStorage.getItem("blog-api-token") || "";

async function readResponse(response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "The request failed.");
  }
  return payload;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [tokenInput, setTokenInput] = useState(savedToken);
  const [activeToken, setActiveToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/posts")
      .then(readResponse)
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function openPost(slug) {
    setLoading(true);
    setError("");
    setSelectedPost(null);

    try {
      const response = await fetch("/posts/" + encodeURIComponent(slug), {
        headers: { Authorization: "Bearer " + activeToken }
      });
      setSelectedPost(await readResponse(response));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function updateTokenInput(value) {
    setTokenInput(value);
    setActiveToken("");
    setError("");
    window.localStorage.setItem("blog-api-token", value);
  }

  function submitToken(event) {
    event.preventDefault();
    const submittedToken = tokenInput.trim();

    if (!submittedToken) {
      setActiveToken("");
      setError("Enter a bearer token before continuing.");
      return;
    }

    setError("");
    setSelectedPost(null);
    setActiveToken(submittedToken);
  }

  function showPosts() {
    setSelectedPost(null);
    setError("");
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" onClick={(event) => {
          event.preventDefault();
          showPosts();
        }}>
          fieldnotes<span>.</span>
        </a>
        <span className="header-note">Ideas for a thoughtful life</span>
      </header>

      <section className="intro">
        <p className="eyebrow">THE JOURNAL</p>
        <h1>{selectedPost ? "A little more to the story." : "Notes worth\ncoming back to."}</h1>
        <p className="intro-copy">
          {selectedPost
            ? "Take a moment, settle in, and enjoy the read."
            : "Short reads on creating, learning, and finding a little more room to think."}
        </p>
      </section>

      {error && <p className="notice error" role="alert">{error}</p>}

      {selectedPost ? (
        <article className="article">
          <button className="back-link" type="button" onClick={showPosts}>← All stories</button>
          <p className="article-meta">{formatDate(selectedPost.created)} <span>·</span> {selectedPost.status}</p>
          <h2>{selectedPost.title}</h2>
          <p className="article-description">{selectedPost.description}</p>
          <div className="article-content">{selectedPost.content}</div>
        </article>
      ) : (
        <>
          <form className="token-panel" aria-label="Post access" onSubmit={submitToken}>
            <label htmlFor="api-token">Bearer token</label>
            <input
              id="api-token"
              type="password"
              value={tokenInput}
              onChange={(event) => updateTokenInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitToken(event);
              }}
              placeholder="Enter your complete bearer token"
              autoComplete="off"
            />
            <button className="token-submit" type="submit">Continue <span aria-hidden="true">→</span></button>
            <span>Press Enter to view stories · any non-empty token works</span>
          </form>

          <section className="post-list" aria-label="Blog posts">
            {!activeToken && <p className="notice">Enter your complete token and press Enter to view the stories.</p>}
            {activeToken && loading && <p className="notice">Loading stories…</p>}
            {activeToken && !loading && posts.map((post, index) => (
              <article className="post-card" key={post.id}>
                <span className="post-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="post-copy">
                  <p className="post-date">{formatDate(post.created)}</p>
                  <h2>{post.title}</h2>
                  <p className="post-description">{post.description}</p>
                  <button className="read-link" type="button" onClick={() => openPost(post.slug)}>
                    Read story <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ))}
            {activeToken && !loading && posts.length === 0 && (
              <p className="notice">No stories are available right now.</p>
            )}
          </section>
        </>
      )}

      <footer className="site-footer">A small corner of the internet to slow down.</footer>
    </main>
  );
}
