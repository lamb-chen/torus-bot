require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs').promises; // Use fs.promises for async operations

const client = new Client();

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.id !== client.user.id) return;

  if (message.content === '!readall') { // Ensure the command is correct
    try {
      let allMessages = [];
      let lastMessageId = null;

      while (true) {
        const messages = await message.channel.messages.fetch({
          limit: 100,
          before: lastMessageId
        });

        if (messages.size === 0) break;

        // Extract detailed message information
        const processedMessages = messages.map(msg => ({
          // Basic info
          messageId: msg.id,
          username: msg.author.username,
          userId: msg.author.id,
          content: msg.content,

          // Time information
          createdTimestamp: msg.createdTimestamp,    // Unix timestamp
          createdAt: msg.createdAt.toISOString(),    // ISO date string

          // Message metadata
          channelId: msg.channelId,
          channelName: msg.channel.name,
          guildId: msg.guildId,

          // Additional features
          attachments: Array.from(msg.attachments.values()).map(att => ({
            url: att.url,
            name: att.name,
            contentType: att.contentType
          })),
          embeds: msg.embeds.length,
          mentions: {
            users: Array.from(msg.mentions.users.values()).map(u => u.username),
            roles: Array.from(msg.mentions.roles.values()).map(r => r.name)
          },
          isPinned: msg.pinned,
          isEdited: msg.editedTimestamp ? true : false,
          editedTimestamp: msg.editedTimestamp
        }));

        allMessages.push(...processedMessages);
        lastMessageId = messages.last().id;
      }

      // Save to file with formatted JSON
      await fs.writeFile('messages.json', JSON.stringify(allMessages, null, 2));
      console.log('All messages saved to messages.json');
      message.channel.send('All messages saved to JSON file.');
    } catch (error) {
      console.error('Error fetching messages:', error);
      message.channel.send(`Failed to fetch messages: ${error.message}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);