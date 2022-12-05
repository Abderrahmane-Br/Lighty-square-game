const statusC = document.querySelector(".status");
const welcome = document.querySelector(".welcome");
let gameScript = document.createElement("script");
gameScript.setAttribute("src", "../scripts/game.js");

if (!localStorage.lightySquare) {
    const instContainer = document.querySelector(".instructions");
    instContainer.style.display = "block";

    const nextBtn = document.querySelector(".nextBtn");
    const instructions = Array.from(document.querySelectorAll(".instruction"));

    let current = 0;

    nextBtn.addEventListener("click", () => {
        slide();
    })

    window.addEventListener("keydown", keydownHandler)

    function keydownHandler(e) {
        if (e.key === "Enter" || e.key === "ArrowRight" || e.key === " ")
            slide();
        welcome.classList.remove("active");
    }

    function slide() {
        if (current < instructions.length - 1) {
            instructions[current].classList.remove("active");
            current++;
            instructions[current].classList.add("active");
        }
        else {
            window.removeEventListener("keydown", keydownHandler);
            statusC.classList.add("active");
            document.body.appendChild(gameScript);
            setTimeout(() => instContainer.style.display = "none", 50);
        }
    }
}
else {
    window.addEventListener("keyup", keyUpHandler)
    statusC.classList.add("active");

    function keyUpHandler() {
        welcome.classList.remove("active");
        window.removeEventListener("keyup", keyUpHandler);
        document.body.appendChild(gameScript);
    }
}
