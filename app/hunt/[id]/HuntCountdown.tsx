"use client"

import { useCountdown } from "@/hooks/useCountdown"

export function HuntCountdown({ endTime }: { endTime: number }) {
  const countdown = useCountdown(endTime)

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Time Remaining</p>
      <p className={`font-semibold text-sm ${countdown ? "text-amber-400" : "text-red-400"}`}>
        {countdown ?? "Ended"}
      </p>
    </div>
  )
}
