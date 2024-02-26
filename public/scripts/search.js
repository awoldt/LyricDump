const input = document.getElementById("homepage_search_input");
const results = document.getElementById("search_results");

input.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }

    await Search(input.value);
  }
});

async function Search(query) {
  try {
    const req = await fetch(`/search?q=${query}`, {
      method: "post",
    });
    const res = await req.json();

    if (res.results.length === 0) {
      const msg = document.createElement("span");
      msg.innerText = "No results";
      results.appendChild(msg);
    } else {
      for (let i = 0; i < res.results.length; i++) {
        const link = document.createElement("a");
        link.setAttribute("href", `/${res.results[i].artist_id}`);
        link.setAttribute("class", "search-results");

        link.innerText = `${res.results[i].name}`;

        results.appendChild(link);
      }
    }
  } catch (err) {
    alert("Error while searching");
  }
}
