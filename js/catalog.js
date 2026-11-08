(() => {
  const catalog = [
      {
        id: "exhaust",
        name: "Exhaust systems",
        items: [["downpipes", "Downpipes"]],
      },
      {
        id: "intake-piping",
        name: "Intake & boost piping",
        items: [
          ["intakes", "Intakes"],
          ["inlet", "Inlet"],
        ],
      },
      {
        id: "cooling",
        name: "Cooling",
        items: [["intercooler", "Intercooler"]],
      },
      {
        id: "suspension",
        name: "Suspension systems",
        items: [
          ["lowering-springs", "Lowering Springs"],
          ["adjustable-suspension", "Sport Adjustable Suspension"],
        ],
      },
      {
        id: "lighting",
        name: "Lighting",
        items: [
          ["headlights", "Headlights"],
          ["taillights", "Taillights"],
        ],
      },
      {
        id: "wheel-fitment",
        name: "Wheels & fitment",
        items: [["spacers", "Spacers"]],
      },
      {
        id: "interior",
        name: "Interior & controls",
        items: [["steering-wheels", "Steering Wheels"]],
      },
      {
        id: "engine",
        name: "Engine internals",
        items: [["forged-internals", "Forged Engine Internals"]],
      },
    ],
    products = [
      {
        id: "n20",
        name: "Downpipe N20",
        engine: "N20",
        fitment: "F22 / F30 / F32 / F33 / F36",
        price: 530,
        make: "BMW",
        photo: true,
      },
      {
        id: "n26",
        name: "Downpipe N26",
        engine: "N26",
        fitment: "F22 / F30 / F32 / F33 / F36",
        price: 530,
        make: "BMW",
        photo: true,
      },
      {
        id: "b46",
        name: "Downpipe B46",
        engine: "B46",
        fitment: "F22 / F30 / F32 / F33 / F36",
        price: 530,
        make: "BMW",
        photo: true,
      },
      {
        id: "b47",
        name: "Downpipe B47",
        engine: "B47",
        fitment: "F22 / F30 / F32 / F33 / F36",
        price: null,
        make: "BMW",
        photo: true,
      },
      {
        id: "b58",
        name: "Downpipe B58 Non OPF/DPF",
        engine: "B58",
        fitment: "All Models",
        price: 550,
        make: "BMW",
        variant: "Non OPF/DPF",
        photo: true,
      },
    ],
    home = document.querySelector("main"),
    surface = document.getElementById("catalog-route"),
    listing = document.getElementById("route-listing"),
    detail = document.getElementById("n20-product"),
    cartDialog = document.getElementById("mfs-cart"),
    key = "mfs-cart-v2",
    photo = detail.querySelector("img").src;
  surface.appendChild(detail);
  const images = JSON.parse(
      document.getElementById("mfs-product-images").textContent,
    ),
    imageFor = (p) => images[p.id] || photo;
  let active = products[0],
    cart = {};
  const money = (n) => new Intl.NumberFormat("en-US").format(n) + " GEL";
  const byId = (id) => products.find((p) => p.id === id);
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    if (raw && typeof raw === "object") {
      for (const p of products) {
        const n = Number(raw[p.id]);
        if (p.price !== null && Number.isInteger(n) && n > 0 && n <= 99)
          cart[p.id] = n;
      }
    } else {
      const old = Number(localStorage.getItem("mfs-cart-n20-v1"));
      if (Number.isInteger(old) && old > 0 && old <= 99) cart.n20 = old;
    }
  } catch {}
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {
      document.getElementById("cart-status").textContent =
        "Cart could not be saved in this browser; it is available for this visit.";
    }
    renderCart();
  }
  function placeholder(p) {
    return (
      '<div class="product-placeholder"><strong>' +
      p.engine +
      "</strong><span>PRODUCT PHOTO COMING SOON</span></div>"
    );
  }
  function renderCart() {
    const ids = products.filter((p) => cart[p.id] && p.price !== null),
      count = ids.reduce((n, p) => n + cart[p.id], 0);
    document.getElementById("cart-count").textContent = count;
    const items = document.getElementById("cart-items"),
      totals = document.getElementById("cart-totals");
    items.innerHTML =
      ids
        .map(
          (p) =>
            '<article class="cart-item">' +
            (p.photo
              ? '<img src="' +
                imageFor(p) +
                '" alt="MFS ' +
                p.engine +
                ' downpipe">'
              : placeholder(p)) +
            "<div><h3>" +
            p.name +
            "</h3><p>" +
            p.fitment +
            "</p><p>" +
            money(p.price) +
            ' each</p><div class="cart-controls"><label>QUANTITY<input type="number" min="1" max="99" step="1" value="' +
            cart[p.id] +
            '" aria-label="Quantity for ' +
            p.name +
            '" data-cart-qty="' +
            p.id +
            '"></label><button type="button" data-remove="' +
            p.id +
            '">Remove</button></div><p>' +
            money(cart[p.id] * p.price) +
            "</p></div></article>",
        )
        .join("") || '<p class="cart-empty">Your cart is empty.</p>';
    totals.innerHTML = ids.length
      ? '<div class="cart-total"><span>Subtotal</span><span>' +
        money(ids.reduce((n, p) => n + cart[p.id] * p.price, 0)) +
        "</span></div>"
      : "";
    items.querySelectorAll("[data-cart-qty]").forEach(
      (input) =>
        (input.onchange = () => {
          const n = Number(input.value);
          if (!Number.isInteger(n) || n < 1 || n > 99) {
            input.value = cart[input.dataset.cartQty];
            return;
          }
          cart[input.dataset.cartQty] = n;
          save();
        }),
    );
    items.querySelectorAll("[data-remove]").forEach(
      (b) =>
        (b.onclick = () => {
          delete cart[b.dataset.remove];
          save();
        }),
    );
  }
  function openCart() {
    renderCart();
    cartDialog.showModal();
  }
  document.getElementById("cart-open").onclick = openCart;
  document.getElementById("product-view-cart").onclick = openCart;
  document
    .querySelectorAll("[data-close]")
    .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
  document.getElementById("continue-shopping").onclick = () =>
    cartDialog.close();
  document.getElementById("add-product").onsubmit = (e) => {
    e.preventDefault();
    if (active.price === null) return;
    const n = Number(document.getElementById("product-quantity").value),
      status = document.getElementById("product-cart-status");
    if (!Number.isInteger(n) || n < 1 || n > 99) return;
    if ((cart[active.id] || 0) + n > 99) {
      status.textContent = "Maximum quantity is 99 per product.";
      return;
    }
    cart[active.id] = (cart[active.id] || 0) + n;
    save();
    status.textContent = n + " added to cart.";
  };
  document.getElementById("back-to-downpipes").onclick = () =>
    (location.hash =
      "#/products/downpipes" +
      (document.getElementById("header-make").value
        ? "?make=" +
          encodeURIComponent(document.getElementById("header-make").value)
        : ""));
  document.getElementById("header-make").onchange = (e) => {
    if (e.target.value)
      location.hash =
        "#/products/downpipes?make=" + encodeURIComponent(e.target.value);
  };
  function card(p) {
    return (
      '<a class="downpipe-product-card" href="#/product/' +
      p.id +
      '"><div class="downpipe-card-photo">' +
      (p.photo
        ? '<img src="' + imageFor(p) + '" alt="MFS ' + p.engine + ' downpipe">'
        : placeholder(p)) +
      '</div><div class="downpipe-card-details"><span class="tiny">BMW / ' +
      p.engine +
      "</span><h3>" +
      p.name +
      "</h3><p>" +
      p.fitment +
      '</p><div class="downpipe-card-price"><span>' +
      (p.price === null ? "Price unavailable" : money(p.price)) +
      "</span><span>↗</span></div></div></a>"
    );
  }
  function grid(make) {
    const matches = products.filter((p) => !make || p.make === make);
    document.getElementById("product-results").innerHTML =
      matches.map(card).join("") ||
      '<p class="make-empty">No downpipes are listed for this make yet.</p>';
    document.getElementById("product-result-count").textContent =
      matches.length + " PRODUCTS";
  }
  function go() {
    const hash = location.hash;
    const [path, query = ""] = hash.slice(2).split("?");
    const bits = path.split("/"),
      params = new URLSearchParams(query),
      routed = hash.startsWith("#/");
    home.hidden = routed;
    surface.hidden = !routed;
    detail.hidden = true;
    listing.hidden = false;
    document.title = "MFS — Performance Perfected";
    if (!routed) {
      if (hash === "#parts" || !hash || hash === "#") {
        window.scrollTo(0, 0);
      } else
        requestAnimationFrame(() =>
          document.getElementById(hash.slice(1))?.scrollIntoView(),
        );
      return;
    }
    let heading = "",
      crumb = "",
      body = "";
    if (bits[0] === "category") {
      const g = catalog.find((g) => g.id === bits[1]);
      if (!g) {
        location.hash = "#parts";
        return;
      }
      heading = g.name;
      crumb = '<a href="#parts">Categories</a><span>/</span>' + g.name;
      body =
        '<div class="subcategory-grid">' +
        g.items
          .map(
            ([id, name]) =>
              '<a class="subcategory-card" href="#/products/' +
              id +
              '"><span class="tiny">' +
              g.name +
              "</span><h2>" +
              name +
              '</h2><span class="link">VIEW PRODUCTS ↗</span></a>',
          )
          .join("") +
        "</div>";
    } else if (bits[0] === "products") {
      const g = catalog.find((g) => g.items.some((x) => x[0] === bits[1])),
        sub = g?.items.find((x) => x[0] === bits[1]);
      if (!sub) {
        location.hash = "#parts";
        return;
      }
      heading = sub[1];
      crumb =
        '<a href="#parts">Categories</a><span>/</span><a href="#/category/' +
        g.id +
        '">' +
        g.name +
        "</a><span>/</span>" +
        sub[1];
      body =
        bits[1] === "downpipes"
          ? '<div class="product-toolbar"><label>CHOOSE YOUR MAKE<select id="product-make"><option value="">All makes</option><option value="BMW">BMW</option><option value="Mercedes">Mercedes</option><option value="Audi">Audi</option><option value="Volkswagen">Volkswagen</option><option value="Alfa Romeo">Alfa Romeo</option></select></label><div class="make-icons" role="group" aria-label="Filter by car brand"><a href="#/products/downpipes?make=BMW" data-make="BMW" aria-label="Show BMW downpipes" title="BMW"><svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="20" cy="20" r="18"/><circle cx="20" cy="22" r="11"/><path d="M20 11v22M9 22h22M20 11a11 11 0 0 1 11 11H20ZM20 33A11 11 0 0 1 9 22h11Z" fill="currentColor"/><text x="20" y="9" text-anchor="middle" font-size="5" stroke="none" fill="currentColor">BMW</text></svg><span>BMW</span></a><a href="#/products/downpipes?make=Mercedes" data-make="Mercedes" aria-label="Show Mercedes downpipes" title="Mercedes"><svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="20" cy="20" r="18"/><path d="M20 3v17L5 29l15-9 15 9-15-9Z"/></svg><span>Mercedes</span></a><a href="#/products/downpipes?make=Audi" data-make="Audi" aria-label="Show Audi downpipes" title="Audi"><svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><g transform="translate(0 9)"><ellipse cx="8" cy="11" rx="7" ry="10"/><ellipse cx="16" cy="11" rx="7" ry="10"/><ellipse cx="24" cy="11" rx="7" ry="10"/><ellipse cx="32" cy="11" rx="7" ry="10"/></g></svg><span>Audi</span></a><a href="#/products/downpipes?make=Volkswagen" data-make="Volkswagen" aria-label="Show Volkswagen downpipes" title="Volkswagen"><svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="20" cy="20" r="18"/><path d="M10 8l10 16L30 8M5 15l9 18 6-9 6 9 9-18"/></svg><span>Volkswagen</span></a><a href="#/products/downpipes?make=Alfa%20Romeo" data-make="Alfa Romeo" aria-label="Show Alfa Romeo downpipes" title="Alfa Romeo"><svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="20" cy="20" r="18"/><circle cx="20" cy="22" r="12"/><path d="M20 10v24M13 13v18M8 20h11M26 12c-9 5 8 7 0 11s4 7 0 10"/><text x="20" y="7.5" text-anchor="middle" font-size="4" stroke="none" fill="currentColor">ALFA ROMEO</text></svg><span>Alfa Romeo</span></a></div><span class="tiny" id="product-result-count"></span></div><div class="downpipes-product-grid" id="product-results"></div>'
          : '<div class="catalog-empty"><h2>Let’s find your fit.</h2><p>Products for this category have not been listed yet. Ask MFS about options for your vehicle.</p><a class="link" href="#fitment">MAKE A FITMENT INQUIRY ↗</a></div>';
    } else if (bits[0] === "product") {
      const p = byId(bits[1]);
      if (!p) {
        location.hash = "#/products/downpipes";
        return;
      }
      active = p;
      listing.hidden = true;
      detail.hidden = false;
      document.getElementById("product-name").textContent = p.name;
      detail.querySelector(".product-fitment").textContent = p.fitment;
      detail.querySelector(".product-price").textContent =
        p.price === null ? "Price unavailable" : money(p.price);
      detail.querySelector(".product-image-panel").innerHTML = p.photo
        ? '<img src="' + imageFor(p) + '" alt="MFS ' + p.engine + ' downpipe">'
        : placeholder(p);
      detail.querySelector(".product-description").textContent =
        "MFS downpipe for " +
        p.engine +
        " builds" +
        (p.variant ? " · " + p.variant : "") +
        ". Confirm exact vehicle compatibility and availability with MFS before ordering.";
      detail.querySelector(".product-specs").innerHTML =
        "<div><dt>Make</dt><dd>BMW</dd></div><div><dt>Engine</dt><dd>" +
        p.engine +
        "</dd></div><div><dt>Models</dt><dd>" +
        p.fitment +
        "</dd></div>" +
        (p.variant
          ? "<div><dt>Version</dt><dd>" + p.variant + "</dd></div>"
          : "") +
        "<div><dt>Price per item</dt><dd>" +
        (p.price === null ? "Not available yet" : money(p.price)) +
        "</dd></div>";
      document.getElementById("product-quantity").value = 1;
      document.getElementById("product-quantity").disabled = p.price === null;
      const add = detail.querySelector("#add-product button");
      add.disabled = p.price === null;
      add.textContent =
        p.price === null ? "PRICE NOT AVAILABLE" : "ADD TO CART ↗";
      document.getElementById("product-cart-status").textContent =
        p.price === null
          ? "Ordering will be available once the price is confirmed."
          : "";
      document.title = p.name + " — MFS";
      window.scrollTo(0, 0);
      return;
    } else {
      location.hash = "#parts";
      return;
    }
    listing.innerHTML =
      '<nav class="breadcrumbs" aria-label="Breadcrumb">' +
      crumb +
      '</nav><h1 class="catalog-page-title" tabindex="-1">' +
      heading +
      "</h1>" +
      body;
    document.title = heading + " — MFS";
    const makeSelect = document.getElementById("product-make");
    if (makeSelect) {
      const make = [
        "BMW",
        "Mercedes",
        "Audi",
        "Volkswagen",
        "Alfa Romeo",
      ].includes(params.get("make"))
        ? params.get("make")
        : "";
      makeSelect.value = make;
      document.getElementById("header-make").value = make;
      grid(make);
      makeSelect.onchange = (e) => {
        location.hash =
          "#/products/downpipes" +
          (e.target.value ? "?make=" + encodeURIComponent(e.target.value) : "");
      };
    }
    window.scrollTo(0, 0);
    listing.querySelector("h1").focus({ preventScroll: true });
  }
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  document.querySelectorAll('a[href="#parts"]').forEach((a) =>
    a.addEventListener("click", () => {
      if (location.hash === "#parts") window.scrollTo(0, 0);
    }),
  );
  window.addEventListener("hashchange", go);
  renderCart();
  go();
})();
