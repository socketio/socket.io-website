(function () {
    var mobileNav = document.querySelector("#mobile-nav");

    function mobileToggle() {
        var style = getComputedStyle(mobileNav);

        mobileNav.classList.remove("mobile-nav-hidden");

        if (style.transform !== "matrix(1, 0, 0, 1, 0, 0)") {
            mobileNav.style.transform = "translate(0)";
        } else {
            mobileNav.removeAttribute("style");
        }
    }

    document.querySelector("#mobile-nav-button").addEventListener('click', (e) => { e.preventDefault(); mobileToggle(); });

    document.querySelector('.mobile-close').addEventListener('click', (e) => { e.preventDefault(); mobileToggle(); })

    document.querySelectorAll("#mobile-nav a").forEach((element) => {
        element.addEventListener('click', mobileToggle);
    });
})();
