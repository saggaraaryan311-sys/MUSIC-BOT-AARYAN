const { createCanvas } = require("@napi-rs/canvas");

class musicCard {
    async generate(options = {}) {
        const config = {
            width: 900,
            height: 300,

            songTitle: options.songTitle || "Unknown Track",
            songArtist: options.songArtist || "Unknown Artist",
            requester: options.requester || "Unknown",

            serverName: options.serverName || "Unknown Server",
            volume: typeof options.volume === "number" ? options.volume : 100
        };

        const canvas = createCanvas(config.width, config.height);
        const ctx = canvas.getContext("2d");

        // BACKGROUND
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, config.width, config.height);

        // CARD
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect(20, 20, 860, 260, 25);
        ctx.fill();

        // TEXT
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px Arial";
        ctx.fillText(config.songTitle, 50, 70);

        ctx.fillStyle = "#c7d2fe";
        ctx.font = "26px Arial";
        ctx.fillText(config.songArtist, 50, 120);

        ctx.fillStyle = "#9ca3af";
        ctx.font = "18px Arial";
        ctx.fillText(`Requested by: ${config.requester}`, 50, 160);

        ctx.fillStyle = "#a5b4fc";
        ctx.fillText(`Server: ${config.serverName}`, 50, 190);

        ctx.fillStyle = "#34d399";
        ctx.fillText(`Volume: ${config.volume}%`, 50, 215);

        return canvas.toBuffer("image/png");
    }
}

module.exports = musicCard;
