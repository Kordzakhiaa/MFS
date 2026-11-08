document.querySelectorAll("[data-filter]").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll("[data-filter]")
        .forEach(
          (x) => (
            x.classList.toggle("active", x === b),
            x.setAttribute("aria-pressed", String(x === b))
          ),
        );
      document
        .querySelectorAll("[data-category]")
        .forEach(
          (x) =>
            (x.hidden =
              b.dataset.filter !== "all" &&
              x.dataset.category !== b.dataset.filter),
        );
    }),
);
document
  .querySelectorAll("[data-interest]")
  .forEach(
    (a) =>
      (a.onclick = () =>
        (document.getElementById("interest").value = a.dataset.interest)),
  );
let brief = "";
document.getElementById("brief").onsubmit = (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  brief =
    "MFS FITMENT INQUIRY\nVehicle: " +
    d.get("vehicle") +
    "\nCategory: " +
    d.get("interest") +
    "\nBuild goals: " +
    d.get("goals");
  document.getElementById("result").textContent = brief;
  document.getElementById("download").classList.remove("hidden");
};
document.getElementById("download").onclick = () => {
  const u = URL.createObjectURL(new Blob([brief], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = u;
  a.download = "mfs-fitment-brief.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};
