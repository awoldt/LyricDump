export default function Nav() {
  return (
    <nav>
      <div className="nav-holder">
        <a href="/">LyricDump</a>
        <div className="nav-right">
          <a
            href="/submitlyrics"
            title="Submit your funny lyrics to be featured on the site"
          >
            Have any funny lyrics?
          </a>
          <a href="/privacy">Privacy</a>
          <a href="/catalogue" title="View all artists">
            Catalogue
          </a>
        </div>
      </div>
    </nav>
  );
}
