'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel = 'from last month',
  unit = '',
  trend = 'neutral',
}: StatCardProps) {
  const trendColor = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-zinc-400',
  };

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Card variant="premium" glow>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-300">
            {label}
          </CardTitle>
          <div className="p-2 bg-gradient-purple/20 rounded-lg">
            <Icon className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm text-zinc-400">{unit}</span>}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${trendColor[trend]}`}>
                {trendIcon[trend]} {Math.abs(change)}%
              </span>
              <span className="text-xs text-zinc-500">{changeLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
