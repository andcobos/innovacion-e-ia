"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ChartData {
  mes: string;
  ventas: number;
  utilidad: number;
}

export function TrendChart({ data }: { data: ChartData[] }) {
  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-center p-6 bg-[#F5F3FF]/30 border border-brand-border border-dashed rounded-[12px]">
        <p className="text-brand-muted font-medium text-sm">
          Registra datos durante 2 meses para ver tu tendencia 📈
        </p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FCE7F3" />
          <XAxis 
            dataKey="mes" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'var(--font-sans)' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'var(--font-sans)' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid #FCE7F3', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            itemStyle={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
            labelStyle={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: '#1F2937', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="ventas" 
            name="Ventas"
            stroke="#FF7F7F" 
            fill="rgba(255,127,127,0.1)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="utilidad" 
            name="Utilidad Neta"
            stroke="#34D399" 
            fill="rgba(52,211,153,0.1)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
