const { SlashCommandBuilder } = require('discord.js');
const { autoplayCollection } = require('../../mongodb.js');
const { sendSuccessResponse, handleCommandError } = require('../../utils/responseHandler.js');
const { getLang } = require('../../utils/languageLoader');

const data = new SlashCommandBuilder()
  .setName("autoplay")
  .setDescription("Toggle autoplay for the server")
  .addBooleanOption(option =>
    option.setName("enable")
      .setDescription("Toggle autoplay on / off")
      .setRequired(true)
  );

module.exports = {
    data: data,
    run: async (client, interaction) => {
        try {
            await interaction.deferReply();

            const lang = await getLang(interaction.guildId);
            const t = lang.music.autoplay;

            const enable = interaction.options.getBoolean('enable');
            const guildId = interaction.guild.id;

            // 1. Database mein save karein
            await autoplayCollection.updateOne(
                { guildId },
                { $set: { autoplay: enable } },
                { upsert: true }
            );

            // 2. PLAYER UPDATE (Zaruri Step)
            // Aapka bot jo bhi music system use kar raha hai (Lavalink/Riorelax etc.)
            // usme autoplay toggle karna hoga.
            const player = client.manager.get(interaction.guild.id); // Manager handle name check karein

            if (player) {
                // Agar player active hai, toh uske andar autoplay set karein
                player.setAutoplay(enable); 
            }

            const content = enable 
                ? t.enabled.title + '\n\n' + t.enabled.message + '\n\n' + t.enabled.note
                : t.disabled.title + '\n\n' + t.disabled.message + '\n\n' + t.disabled.note;

            // Red color ke liye '#ff0000' use ho raha hai enable false hone par
            return await sendSuccessResponse(
                interaction,
                content,
                enable ? '#00ff00' : '#ff0000'
            );

        } catch (error) {
            console.error(error); // Error console par dekhein
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { autoplay: { errors: {} } } }));
            const t = lang.music?.autoplay?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'autoplay',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while updating autoplay settings.')
            );
        }
    }
};
