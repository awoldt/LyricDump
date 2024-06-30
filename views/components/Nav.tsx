export default function Nav() {
  return (
    <nav>
      <div className="nav-holder">
        <div className="nav-sub">
          <a href="/">Lyric Dump</a>
          <a href="/catalogue" title="View all Artists">
            Artists
          </a>
        </div>
        <div className="nav-sub">
          <a href="/submitlyrics" title="Submit Lyrics to be Featured">
            Submit
          </a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </nav>
  );
}
