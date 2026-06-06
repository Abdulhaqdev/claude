"use client";

import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

interface ActivityItem {
  id: string;
  action: string;
  entity: string;
  createdAt: Date | string;
  user?: { firstName: string; lastName: string } | null;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[10px]">
                  {activity.user
                    ? getInitials(activity.user.firstName, activity.user.lastName)
                    : "SY"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm">
                  <span className="font-medium">
                    {activity.user
                      ? `${activity.user.firstName} ${activity.user.lastName}`
                      : "System"}
                  </span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.entity}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(activity.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
          {activities.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent activity
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
