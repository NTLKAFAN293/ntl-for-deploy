import BotLogs from '../BotLogs';

export default function BotLogsExample() {
  return (
    <BotLogs
      botId="sample-bot-id"
      onClearLogs={() => console.log('مسح السجلات')}
    />
  );
}