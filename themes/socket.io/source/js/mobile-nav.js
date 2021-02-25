(function () {
    var mobileNav = document.querySelector("#mobile-nav");

    function mobileToggle(e) {
        e.preventDefault();

        var style = getComputedStyle(mobileNav);

        mobileNav.classList.remove("mobile-nav-hidden");

        if (style.transform !== "matrix(1, 0, 0, 1, 0, 0)") {
            mobileNav.style.transform = "translate(0)";
        } else {
            mobileNav.removeAttribute("style");
        }
    }

    document.querySelector("#mobile-nav-button").addEventListener('click', mobileToggle);
})();
