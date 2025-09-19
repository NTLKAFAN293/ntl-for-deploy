import { useState } from 'react';
import BotControlPanel from '../BotControlPanel';

export default function BotControlPanelExample() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <BotControlPanel
      botName="بوت الإدارة العام"
      isOnline={isOnline}
      onStartBot={() => setIsOnline(true)}
      onStopBot={() => setIsOnline(false)}
      onTokenChange={(token) => console.log('Token changed:', token.slice(0, 10) + '...')}
    />
  );
}