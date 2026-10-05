(function () {
  var d = document.documentElement;
  var theme = "dark";
  var palette = "forest";
  var a11y = false;
  var locale = "hu";
  function apply() {
    d.classList.remove(
      "light",
      "light-mode",
      "dark",
      "palette-forest",
      "palette-slate",
      "palette-bronze",
      "a11y-vision",
      "accessibility-mode",
    );
    d.classList.add(theme === "light" ? "light" : "dark");
    if (theme === "light") d.classList.add("light-mode");
    d.classList.add("palette-" + palette);
    d.setAttribute("data-theme", theme + "-" + palette);
    d.style.colorScheme = theme;
    if (a11y) {
      d.classList.add("a11y-vision", "accessibility-mode");
      d.setAttribute("data-accessibility", "active");
    } else d.removeAttribute("data-accessibility");
    d.lang = locale;
    d.setAttribute("data-locale", locale);
    d.setAttribute("data-currency", locale === "en" ? "EUR" : "HUF");
  }
  function fromToken(t) {
    if (!t) return;
    var p = decodeURIComponent(t).split(".");
    if (p[0] === "light" || p[0] === "dark") theme = p[0];
    if (p[1] === "slate" || p[1] === "forest" || p[1] === "bronze") palette = p[1];
    if (p[2] === "1") a11y = true;
    if (p[2] === "0") a11y = false;
    if (p[3] === "en" || p[3] === "hu") locale = p[3];
  }
  try {
    var lsT = localStorage.getItem("szcenario_theme");
    var lsP = localStorage.getItem("szcenario_palette");
    var lsA = localStorage.getItem("szcenario_a11y");
    var lsL = localStorage.getItem("szcenario_locale");
    if (lsT === "light" || lsT === "dark") theme = lsT;
    if (lsP === "slate" || lsP === "forest" || lsP === "bronze") palette = lsP;
    if (lsA === "1") a11y = true;
    if (lsA === "0") a11y = false;
    if (lsL === "en" || lsL === "hu") locale = lsL;
    var m = document.cookie.match(/(?:^|; )szcenario_view=([^;]*)/);
    fromToken(m ? m[1] : "");
    var q = new URLSearchParams(location.search);
    var qt = q.get("theme");
    var qp = q.get("palette");
    var qa = q.get("a11y");
    var ql = q.get("lang") || q.get("locale");
    if (qt === "light" || qt === "dark") theme = qt;
    if (qp === "slate" || qp === "forest" || qp === "bronze") palette = qp;
    if (qa === "1") a11y = true;
    if (qa === "0") a11y = false;
    if (ql === "en" || ql === "hu") locale = ql;
    localStorage.setItem("szcenario_theme", theme);
    localStorage.setItem("szcenario_palette", palette);
    localStorage.setItem("szcenario_a11y", a11y ? "1" : "0");
    localStorage.setItem("szcenario_locale", locale);
    localStorage.setItem("szcenario_currency", locale === "en" ? "EUR" : "HUF");
    var host = location.hostname.toLowerCase();
    var domain =
      host === "szcenario.hu" || host.slice(-13) === ".szcenario.hu" ? "; Domain=.szcenario.hu" : "";
    document.cookie =
      "szcenario_view=" +
      theme +
      "." +
      palette +
      "." +
      (a11y ? "1" : "0") +
      "." +
      locale +
      "; Path=/; Max-Age=31536000; SameSite=Lax" +
      domain;
  } catch (e) {}
  apply();
})();
