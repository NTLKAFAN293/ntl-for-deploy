import BotStatusCard from '../BotStatusCard';

export default function BotStatusCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BotStatusCard
        botName="بوت الإدارة الرئيسي"
        isOnline={true}
        uptime="02:45:32"
        serversCount={15}
        usersCount={1250}
        messagesCount={8420}
        lastActivity="منذ 2 دقيقة"
        onViewLogs={() => console.log('عرض السجلات')}
        onOpenSettings={() => console.log('فتح الإعدادات')}
      />
      
      <BotStatusCard
        botName="بوت الموسيقى"
        isOnline={false}
        uptime="00:00:00"
        serversCount={8}
        usersCount={420}
        messagesCount={1250}
        lastActivity="منذ 3 ساعات"
        onViewLogs={() => console.log('عرض السجلات')}
        onOpenSettings={() => console.log('فتح الإعدادات')}
      />
    </div>
  );
}