import { Camera, Video, Plane } from "lucide-react";
import type { MediaSchedule } from "@/lib/types";
import { formatScheduleDate } from "@/lib/dates";

export function MediaScheduleView({ schedule }: { schedule: MediaSchedule }) {
  const items: { icon: React.ReactNode; label: string; date: string }[] = [
    { icon: <Camera size={14} />, label: "Photography", date: schedule.photographerDate },
    { icon: <Video size={14} />, label: "Video tour", date: schedule.videoTourDate },
  ];
  if (schedule.droneDate) {
    items.push({ icon: <Plane size={14} />, label: "Drone footage", date: schedule.droneDate });
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.label}
          className="rounded-md border border-navy-100 bg-white px-3 py-3"
        >
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
            <span className="text-gold">{item.icon}</span>
            {item.label}
          </p>
          <p className="mt-1 text-sm font-medium text-navy">
            {formatScheduleDate(item.date)}
          </p>
        </li>
      ))}
    </ul>
  );
}
