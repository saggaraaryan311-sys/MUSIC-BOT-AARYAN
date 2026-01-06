const { createCanvas, loadImage } = require("@napi-rs/canvas");
const serverName = options.serverName || "Unknown Server";
const volume = typeof options.volume === "number" ? options.volume : 100;


class musicCard {
    async generate(options) {
        const config = {
            width: 900,
            height: 300,

            songTitle: options.songTitle || "Unknown Track",
            songArtist: options.songArtist || "Unknown Artist",
            thumbnail: options.thumbnail || null,
            requester: options.requester || "Unknown",

            // 🔥 FIX
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

        // TITLE
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px Arial";
        ctx.fillText(config.songTitle, 50, 70);

        // ARTIST
        ctx.fillStyle = "#c7d2fe";
        ctx.font = "26px Arial";
        ctx.fillText(config.songArtist, 50, 120);

        // REQUESTER
        ctx.fillStyle = "#9ca3af";
        ctx.font = "18px Arial";
        ctx.fillText(`Requested by: ${config.requester}`, 50, 160);

        // ✅ SERVER NAME
        ctx.fillStyle = "#a5b4fc";
        ctx.font = "18px Arial";
        ctx.fillText(`Server: ${config.serverName}`, 50, 190);

        // ✅ VOLUME
        ctx.fillStyle = "#34d399";
        ctx.fillText(`Volume: ${config.volume}%`, 50, 215);

        return canvas.toBuffer("image/png");
    }
}

module.exports = musicCard;
