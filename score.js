let score = {
    firstGame: true,
    losses: 0,
    time: "",
}

if (!localStorage.lightySquare)
    localStorage.lightySquare = JSON.stringify(score);