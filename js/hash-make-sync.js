(() => {
  function syncMakes() {
    const make =
      new URLSearchParams(location.hash.split("?")[1] || "").get("make") || "";
    document
      .querySelectorAll("[data-make]")
      .forEach((a) =>
        a.setAttribute("aria-pressed", String(a.dataset.make === make)),
      );
  }
  window.addEventListener("hashchange", syncMakes);
  syncMakes();
})();
