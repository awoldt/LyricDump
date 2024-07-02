export default function Nav() {
  return (
    // <nav>
    //   <div className="nav-holder">
    //     <div className="nav-sub">
    //       <a href="/">Lyric Dump</a>
    //       <a href="/catalogue" title="View all Artists">
    //         Artists
    //       </a>
    //     </div>
    //     <div className="nav-sub">
    //       <a href="/submitlyrics" title="Submit Lyrics to be Featured">
    //         Submit
    //       </a>
    //       <a href="/privacy">Privacy</a>
    //     </div>
    //   </div>
    // </nav>
    <>
      <div style="width: 100%; position: fixed; z-index: 2;       height: 2.5rem;   background-color: rgb(255, 255, 100); display: flex; justify-content: center; align-items: center;">
        <a
          href="/"
          style="font-size: clamp(1rem, 4vw, 1.25rem); font-weight: 600; opacity: 1"
        >
          LYRIC DUMP
        </a>
        {/* <input
          type="search"
          name="search_query"
          id="homepage_search_input"
          placeholder="Search any artist"
        />
        <div id="search_results"></div>
        <script src="/scripts/search.js"></script>*/}
      </div>
      <div style="width: 100%; position: fixed; z-index: 2; top:2.5rem; height: 2.5rem; background-color: black; display: flex; justify-content: center; align-items: center; gap: 2rem;">
        <a href="/" style="color: white;">
          FEATURED
        </a>
        <span style="color: white;">{"|"}</span>
        <a href="/" style="color: white;">
          RECENTLY ADDED
        </a>
        <span style="color: white;">{"|"}</span>
        <a href="/" style="color: white;">
          POPULAR ARTISTS
        </a>
        <span style="color: white;">{"|"}</span>
        <a href="/catalogue" style="color: white;">
          ALL ARTISTS
        </a>
        <span style="color: white;">{"|"}</span>
        <a href="/submitlyrics" style="color: white;">
          SUBMIT
        </a>
      </div>
    </>
  );
}
