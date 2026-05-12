import { Bell, Tag, Calendar, Sparkles } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';
import { useTranslation } from 'react-i18next';

export function NotificationsScreen() {
  const { t } = useTranslation();

  const PLACEHOLDER_NOTIFICATIONS = [
    {
      id: 1,
      icon: Sparkles,
      iconBg: 'bg-xplora-icon-bg',
      iconColor: 'text-xplora-primary',
      title: t('notifications.notif1Title'),
      body: t('notifications.notif1Body'),
      time: t('notifications.notif1Time'),
      unread: true,
    },
    {
      id: 2,
      icon: Tag,
      iconBg: 'bg-xplora-accent-teal/10',
      iconColor: 'text-xplora-accent-teal',
      title: t('notifications.notif2Title'),
      body: t('notifications.notif2Body'),
      time: t('notifications.notif2Time'),
      unread: true,
    },
    {
      id: 3,
      icon: Calendar,
      iconBg: 'bg-xplora-accent-green/10',
      iconColor: 'text-xplora-accent-green',
      title: t('notifications.notif3Title'),
      body: t('notifications.notif3Body'),
      time: t('notifications.notif3Time'),
      unread: false,
    },
  ];

  const unreadCount = PLACEHOLDER_NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl">{t('notifications.title')}</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-medium">
                {unreadCount} {t('notifications.new')}
              </span>
            )}
          </div>
          <p className="text-sm md:text-base opacity-90">{t('notifications.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6">
        {PLACEHOLDER_NOTIFICATIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-xplora-icon-bg flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-xplora-primary" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">{t('notifications.allCaughtUp')}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('notifications.emptyDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {PLACEHOLDER_NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className={`flex gap-4 p-4 rounded-2xl border transition-colors cursor-pointer hover:bg-muted/30 ${
                    n.unread ? 'bg-card border-border' : 'bg-background border-transparent'
                  }`}
                >
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${n.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${n.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-snug ${n.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                        {n.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{n.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SimpleFooter />
    </div>
  );
}
