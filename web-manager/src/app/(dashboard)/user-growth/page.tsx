'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import apiClient from '@/lib/api/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface UserGrowthPoint {
  date: string
  newUsers: number
  totalUsers: number
}

interface UserGrowthResponse {
  series: UserGrowthPoint[]
  summary: {
    totalUsers: number
    firstJoinDate: string | null
    lastJoinDate: string | null
  }
}

const chartConfig = {
  totalUsers: {
    label: 'Total Users',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export default function UserGrowthPage() {
  const [data, setData] = useState<UserGrowthPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserGrowth = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get<UserGrowthResponse>('/users/user-growth-timeseries')
      setData(response.data.series)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } }
      setError(
        axiosErr.response?.data?.message ??
          axiosErr.response?.data?.error ??
          'Failed to load user growth data.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchUserGrowth()
  }, [fetchUserGrowth])

  const totalUsers = useMemo(() => data[data.length - 1]?.totalUsers ?? 0, [data])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Growth</h1>
        <p className="text-sm text-muted-foreground">
          Cumulative user count over time based on each user&apos;s join date.
        </p>
      </div>

      <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Total Users Over Time</CardTitle>
          <CardDescription>
            Current users: <span className="font-semibold text-foreground">{totalUsers}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
              Loading chart data...
            </div>
          ) : error ? (
            <div className="flex h-[380px] items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 px-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
              No user records found.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[380px] w-full">
              <LineChart
                data={data}
                margin={{
                  left: 12,
                  right: 12,
                  top: 8,
                  bottom: 8,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  tickFormatter={(value: string) =>
                    new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={48} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      }
                    />
                  }
                />
                <Line
                  dataKey="totalUsers"
                  type="monotone"
                  stroke="var(--color-totalUsers)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
