const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { autoplayCollection } = require('../../mongodb.js');
const { getLang } = require('../../utils/languageLoader.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("247")
        .setDescription("Bot ko hamesha voice channel mein rakhein")
        .addBooleanOption(option =>
            option.setName("enable")
                .setDescription("Enable ya Disable karein")
                .setRequired(true)
        ),

    run: async (client, interaction) => {
        try {
            await interaction.deferReply();
            const lang = await getLang(interaction.guildId);
            const enable = interaction.options.getBoolean('enable');

            // Sirf Owner hi 24/7 change kar sake
            if (interaction.guild.ownerId !== interaction.user.id) {
                const noAccess = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`❌ **Access Denied:** Sirf Server Owner hi ye kar sakta hai.`);
                return interaction.editReply({ embeds: [noAccess] });
            }

            // 1. Database Update
            await autoplayCollection.updateOne(
                { guildId: interaction.guild.id },
                { $set: { twentyfourseven: enable } },
                { upsert: true }
            );

            // 2. Music Player Update (Lavalink)
            // Aapka bot 'client.manager' use kar raha hai
            const player = client.manager.get(interaction.guild.id);
            if (player) {
                // Professional bots mein player object ke andar ye set karna zaruri hai
                player.set("247", enable); 
            }

            // 3. Professional Red/Green Response
            const statusEmbed = new EmbedBuilder()
                .setColor(enable ? '#00ff00' : '#ff0000')
                .setTitle(enable ? "✅ 24/7 Mode Enabled" : "⏹️ 24/7 Mode Disabled")
                .setDescription(enable 
                    ? "Bot ab voice channel mein **24/7** ruka rahega, chahe queue khali ho." 
                    : "Bot ab gaana khatam hone par VC chod dega.")
                .setFooter({ text: `Requested by ${interaction.user.username}` });

            const msg = await interaction.editReply({ embeds: [statusEmbed] });

            // 5 seconds baad message delete (Chat clean rakhne ke liye)
            setTimeout(() => msg.delete().catch(() => {}), 5000);

        } catch (error) {
            console.error("247 Command Error:", error);
            await interaction.editReply({ content: "❌ Kuch galat hua, please check console." });
        }
    }
};
