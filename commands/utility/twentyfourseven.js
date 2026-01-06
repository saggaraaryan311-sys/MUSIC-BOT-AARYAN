const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { autoplayCollection } = require('../../mongodb.js');
const { getLang } = require('../../utils/languageLoader.js');
const { handleCommandError } = require('../../utils/responseHandler.js');

const data = new SlashCommandBuilder()
  .setName("247")
  .setDescription("Toggle 24/7 mode (keep bot in voice channel)")
  .addBooleanOption(option =>
    option.setName("enable")
      .setDescription("Enable or disable 24/7 mode")
      .setRequired(true)
  );

module.exports = {
    data: data,
    run: async (client, interaction) => {
        try {
            await interaction.deferReply();
            const lang = await getLang(interaction.guildId);

            // Access Denied Logic
            if (interaction.guild.ownerId !== interaction.user.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`## ❌ Access Denied\n\n${lang.utility.twentyfourseven.accessDenied.message}`);

                const reply = await interaction.editReply({ embeds: [errorEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return;
            }

            const enable = interaction.options.getBoolean('enable');
            const guildId = interaction.guild.id;

            // Database update
            await autoplayCollection.updateOne(
                { guildId },
                { $set: { twentyfourseven: enable } },
                { upsert: true }
            );

            // Logic to keep bot in VC (Lavalink player check)
            const player = client.manager.get(interaction.guild.id);
            if (player) {
                player.twentyFourSeven = enable; // Player property update
            }

            const embedColor = enable ? '#00ff00' : '#ff0000';
            const statusText = enable 
                ? `## ✅ 24/7 Enabled\n\n${lang.utility.twentyfourseven.enabled.message}`
                : `## ⏹️ 24/7 Disabled\n\n${lang.utility.twentyfourseven.disabled.message}`;

            const statusEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(statusText)
                .setFooter({ text: "Settings updated successfully" });

            const reply = await interaction.editReply({ embeds: [statusEmbed] });
            
            // Auto-delete message to keep chat clean
            setTimeout(() => reply.delete().catch(() => {}), 5000);

        } catch (error) {
            console.error(error);
            return handleCommandError(interaction, error, '247');
        }
    }
};
