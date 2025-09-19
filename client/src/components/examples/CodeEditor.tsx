import { useState } from 'react';
import CodeEditor from '../CodeEditor';

export default function CodeEditorExample() {
  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'index.js',
      content: `const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(\`تم تسجيل الدخول باسم \${client.user.tag}!\`);
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.login(process.env.BOT_TOKEN);`,
      language: 'javascript' as const,
      isDirty: false,
    },
    {
      id: '2',
      name: 'config.json',
      content: `{
  "prefix": "!",
  "description": "بوت ديسكورد رائع",
  "version": "1.0.0",
  "permissions": [
    "SEND_MESSAGES",
    "READ_MESSAGE_HISTORY"
  ]
}`,
      language: 'json' as const,
      isDirty: true,
    },
  ]);

  const handleFileChange = (fileId: string, content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, content, isDirty: true }
        : file
    ));
  };

  const handleSave = (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isDirty: false }
        : file
    ));
  };

  const handleFileDelete = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <CodeEditor
      files={files}
      onFileChange={handleFileChange}
      onSave={handleSave}
      onFileDelete={handleFileDelete}
      onFileCreate={(name, language) => {
        const newFile = {
          id: Date.now().toString(),
          name,
          content: '',
          language: language as 'javascript' | 'python' | 'json',
          isDirty: false,
        };
        setFiles(prev => [...prev, newFile]);
      }}
    />
  );
}