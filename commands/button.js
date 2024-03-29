const fs = require('fs');
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

const buttons = fs.readdirSync('./buttons/json')
  .filter(f => f.endsWith('.json'))
  .flatMap(file => require(`../buttons/json/${file}`));
const buttonNames = buttons.map((b) => ({
  ...b,
  name: `${b.title} (${b.fileName})`,
}));

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
    .setName('button')
    .setDescription('Joue un son sur le channel voix.')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('nom')
        .setDescription('Le nom du fichier qui sera joué')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async showAutocomplete(interaction) {
    if (interaction.options.getFocused(true).name !== 'nom') return;

    interaction.respond(
      filter(buttonNames, interaction.options.getString('nom'), {
        key: 'name',
        maxResults: 25,
      }).map((result) => ({
        name: result.name,
        value: result.fileName,
      }))
    );
  },

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
        const results = filter(buttons, interaction.options.getString('nom'), {
          key: 'fileName',
          maxResults: 5,
        });

        if (results.length === 0) {
          interaction.reply({
            content: 'Aucun son trouvé !',
            ephemeral: true,
          });
          return;
        }

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
            join(__dirname, '../buttons/sounds/', results[0].fileName + '.mp3')
          );

          player.play(resource);

          console.log(`Playing sound ${results[0].fileName}`);

          interaction.reply({
            content: `${interaction.options.getString('nom')} -> ${
              results[0].title
            } (${results[0].fileName})`,
          });
        } catch (error) {
          console.error(error);
          connection.destroy();
        }
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
