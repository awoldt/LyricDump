export default function Nav() {
  return (
    <header>
      <nav class="navbar">
        <a href="/">LyricDump</a>
        <a
          class="right-link"
          href="/submitlyrics"
          title="Submit your funny lyrics to be featured on the site"
        >
          Have any funny lyrics?
        </a>
        <a class="right-link" href="/privacy">
          Privacy
        </a>
        <a class="right-link" href="/catalogue" title="View all artists">
          Catalogue
        </a>
      </nav>
    </header>
  );
}
