(function normalizeWorkPath() {
  const id = new URLSearchParams(location.search).get("id");
  if (id && location.pathname === "/") {
    history.replaceState(null, "", "/work/" + encodeURIComponent(id));
  }
})();

window.va = window.va || function () {
  (window.vaq = window.vaq || []).push(arguments);
};
