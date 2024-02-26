export default function Search() {
  return (
    <>
      <input type="search" placeholder="Search any artist" id="homepage_search_input" style="margin-bottom: 10px"/>
      <div id="search_results"></div>
      <script src="/scripts/search.js"></script>
    </>
  );
}
