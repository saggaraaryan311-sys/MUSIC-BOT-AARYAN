const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");

/* ------------------ YOUTUBE HELPERS ------------------ */

function tryExtractYouTubeId(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
        if (u.hostname === "youtu.be") return u.pathname.slice(1);
    } catch {
        if (/^[\w-]{11}$/.test(url)) return url;
    }
    return null;
}

async function fetchImage(url) {
    try {
        const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 3000,
        });
        return Buffer.from(res.data);
    } catch {
        return null;
    }
}

async function getYouTubeThumb(id) {
    if (!id) return null;
    const urls = [
        `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    ];
    for (const u of urls) {
        const buf = await fetchImage(u);
        if (buf) return buf;
    }
    return null;
}

/* ------------------ MAIN CLASS ------------------ */

class EnhancedMusicCard {
    async generateCard(options = {}) {
        const config = {
            width: 900,
            height: 300,

            songTitle: options.songTitle || "Unknown Track",
            songArtist: options.songArtist || "Unknown Artist",
            trackRequester: options.trackRequester || "Unknown",

            // 🔥 NEW
            serverName: options.serverName || "Unknown Server",
            volume: typeof options.volume === "number" ? options.volume : 100,

            thumbnailURL: options.thumbnailURL || "",
            trackURI: options.trackURI || options.thumbnailURL || "",
        };

        const canvas = createCanvas(config.width, config.height);
        const ctx = canvas.getContext("2d");

        this.drawBackground(ctx, config);
        await this.drawThumbnail(ctx, config);
        this.drawText(ctx, config);
        this.drawVisualizer(ctx);

        return canvas.toBuffer("image/png");
    }

    /* ------------------ BACKGROUND ------------------ */

    drawBackground(ctx, cfg) {
        const g = ctx.createLinearGradient(0, 0, cfg.width, cfg.height);
        g.addColorStop(0, "#0f172a");
        g.addColorStop(1, "#020617");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cfg.width, cfg.height);

        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.roundRect(20, 20, cfg.width - 40, cfg.height - 40, 25);
        ctx.fill();
    }

    /* ------------------ THUMBNAIL ------------------ */

    async drawThumbnail(ctx, cfg) {
        const size = 220;
        const x = cfg.width - size - 50;
        const y = 40;

        let yt = tryExtractYouTubeId(cfg.trackURI);
        let buffer = yt ? await getYouTubeThumb(yt) : null;

        if (buffer) {
            const img = await loadImage(buffer);
            ctx.save();
            ctx.roundRect(x, y, size, size, 20);
            ctx.clip();
            ctx.drawImage(img, x, y, size, size);
            ctx.restore();
        } else {
            ctx.fillStyle = "#1e293b";
            ctx.roundRect(x, y, size, size, 20);
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.font = "bold 40px Arial";
            ctx.fillText("🎵", x + 85, y + 140);
        }
    }

    /* ------------------ TEXT ------------------ */

    drawText(ctx, cfg) {
        const x = 50;
        let y = 60;

        ctx.fillStyle = "#fff";
        ctx.font = "bold 38px Arial";
        ctx.fillText(cfg.songTitle, x, y);

        y += 50;
        ctx.fillStyle = "#cbd5f5";
        ctx.font = "26px Arial";
        ctx.fillText(cfg.songArtist, x, y);

        y += 38;
        ctx.fillStyle = "#9ca3af";
        ctx.font = "18px Arial";
        ctx.fillText(`Requested by: ${cfg.trackRequester}`, x, y);

        // 🔥 SERVER NAME
        y += 28;
        ctx.fillStyle = "#60a5fa";
        ctx.font = "bold 18px Arial";
        ctx.fillText(`Server: ${cfg.serverName}`, x, y);

        // 🔥 VOLUME
        y += 26;
        ctx.fillStyle = "#34d399";
        ctx.fillText(`Volume: ${cfg.volume}%`, x, y);
    }

    /* ------------------ VISUALIZER ------------------ */

    drawVisualizer(ctx) {
        const bars = 28;
        const baseY = 260;
        let x = 50;

        for (let i = 0; i < bars; i++) {
            const h = 20 + Math.random() * 50;
            ctx.fillStyle = "#3b82f6";
            ctx.roundRect(x, baseY - h, 8, h, 4);
            ctx.fill();
            x += 12;
        }
    }
}

module.exports = { EnhancedMusicCard };
