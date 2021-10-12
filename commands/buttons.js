const { join } = require('path');
const {
  SlashCommandBuilder,
  SlashCommandStringOption,
} = require('@discordjs/builders');
const { filter } = require('fuzzaldrin');
const {
  createAudioPlayer,
  joinVoiceChannel,
  AudioPlayerStatus,
  createAudioResource,
} = require('@discordjs/voice');
const { MessageActionRow, MessageButton } = require('discord.js');

const buttons = require('../buttons/json/data.json');

const player = createAudioPlayer();

player.on('stateChange', (oldState, newState) => {
  if (
    oldState.status === AudioPlayerStatus.Playing &&
    newState.status === AudioPlayerStatus.Idle
  ) {
    player.connection.destroy();
  }
});

player.on('error', (err) => {
  player.lastInteraction.reply({
    content: 'Erreur de lecture :(',
    ephemeral: true,
  });
  console.error(err);
  player.connection.destroy();
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buttons')
    .setDescription(
      'Cherche parmi les boutons disponbile et joue un son sur le channel voix.'
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('recherche')
        .setDescription('Mots clés du bouton recherché')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      if (!interaction.guild) {
        interaction.reply({
          content: 'Déso, pas déso, mais ça fonctionne que dans un serveur !',
          ephemeral: true,
        });
        return;
      }

      if (interaction.member.voice.channel) {
        const results = filter(
          buttons,
          interaction.options.getString('recherche'),
          {
            key: 'title',
            maxResults: 5,
          }
        );

        if (results.length === 0) {
          interaction.reply({
            content: 'Aucun son trouvé !',
            ephemeral: true,
          });
          return;
        }

        const row = new MessageActionRow().addComponents(
          results.map(({ title, fileName }) =>
            new MessageButton()
              .setCustomId(fileName)
              .setLabel(title)
              .setStyle('PRIMARY')
          )
        );

        interaction.reply({
          content: 'Choisis ton son !',
          components: [row],
          ephemeral: true,
        });

        const collector = interaction.channel.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.member.id,
          time: 15000,
        });

        collector.on('collect', async (i) => {
          await i.update({
            content: 'Tu as choisi ' + i.customId,
            components: [],
          });

          const result = results.find((r) => r.fileName === i.customId);

          const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.member.voice.channel.guild.id,
            adapterCreator:
              interaction.member.voice.channel.guild.voiceAdapterCreator,
          });

          player.connection = connection;
          player.lastInteraction = interaction;

          try {
            connection.subscribe(player);

            const resource = createAudioResource(
              join(
                __dirname,
                '../buttons/sounds/',
                result.fileName + '.mp3'
              )
            );

            player.play(resource);

            console.log(`Playing sound ${result.fileName}`);

            // TODO: it would be nice if there was a way to reply to the slash command directly instead
            await interaction.followUp({
              content: `${result.title} (${result.fileName})`,
            });
          } catch (error) {
            console.error(error);
            connection.destroy();
          }
        });

        collector.on('end', async (collected) => {
          if (collected.size !== 0) return;

          await interaction.editReply({
            content: "Tu n'as pas choisi de son. :(",
            components: [],
          });
        });
      } else {
        interaction.reply({
          content:
            "Si tu veux faire du bruit, rejoins d'abord un channel voix !",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      connection.destroy();
    }
  },
};
