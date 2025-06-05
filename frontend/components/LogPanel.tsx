'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

type LogType = 'debug' | 'audit' | 'error'

interface Log {
  id: string
  type: LogType
  message: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export function LogPanel() {
  const [logs, setLogs] = useState<Log[]>([])
  const [activeTab, setActiveTab] = useState<LogType>('debug')

  // Simulate fetching logs
  useEffect(() => {
    const fetchLogs = async () => {
      // TODO: Replace with actual API call
      const mockLogs: Log[] = [
        {
          id: '1',
          type: 'audit',
          message: 'User updated profile',
          timestamp: new Date(),
          metadata: {
            actor_id: 101,
            action: 'create',
            target_table: 'contacts',
            target_id: 55,
            data: {
              name: 'Nguyen Van A',
              email: 'a@example.com',
              phone: '0909090909',
            },
            created_at: '2024-06-01 10:00:00',
          },
        },
        {
          id: '2',
          type: 'audit',
          message: 'Admin deleted post',
          timestamp: new Date(),
          metadata: {
            actor_id: 1,
            action: 'delete',
            target_table: 'posts',
            target_id: 99,
            data: { title: 'Hello world' },
            created_at: '2024-06-01 11:00:00',
          },
        },
        {
          id: '3',
          type: 'error',
          message: 'Failed to fetch data',
          timestamp: new Date(),
          metadata: {
            actor_id: 2,
            action: 'delete',
            target_table: 'accounts',
            target_id: 77,
            data: { error: 'Network error' },
            created_at: '2024-06-01 12:00:00',
          },
        },
      ]
      setLogs(mockLogs)
    }

    fetchLogs()
  }, [])

  const getLogColor = (type: LogType) => {
    switch (type) {
      case 'debug':
        return 'bg-blue-100 text-blue-800'
      case 'audit':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLogs = logs.filter((log) => log.type === activeTab)

  return (
    <Card className="m-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Log Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as LogType)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="debug">
              Debug
              <Badge variant="secondary" className="ml-2">
                {logs.filter((log) => log.type === 'debug').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="audit">
              Audit
              <Badge variant="secondary" className="ml-2">
                {logs.filter((log) => log.type === 'audit').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="error">
              Error
              <Badge variant="secondary" className="ml-2">
                {logs.filter((log) => log.type === 'error').length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-2">
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <Badge className={getLogColor(log.type)}>
                        {log.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(log.timestamp, 'HH:mm:ss dd/MM/yyyy', {
                          locale: vi,
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                    {log.metadata && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs text-left border border-muted rounded-md">
                          <thead>
                            <tr>
                              {Object.keys(log.metadata).map((key) => (
                                <th
                                  key={key}
                                  className="px-2 py-1 font-semibold bg-muted text-muted-foreground border-b"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {Object.values(log.metadata).map((value, idx) => (
                                <td key={idx} className="px-2 py-1 border-b">
                                  {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
