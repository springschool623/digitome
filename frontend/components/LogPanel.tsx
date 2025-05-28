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
  metadata?: Record<string, string | number>
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
          type: 'debug',
          message: 'Component mounted',
          timestamp: new Date(),
          metadata: { component: 'LogPanel' },
        },
        {
          id: '2',
          type: 'audit',
          message: 'User updated account settings',
          timestamp: new Date(),
          metadata: { userId: 123, action: 'update' },
        },
        {
          id: '3',
          type: 'error',
          message: 'Failed to fetch data',
          timestamp: new Date(),
          metadata: { error: 'Network error' },
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
    <Card className="mt-4">
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
                      <pre className="text-xs text-muted-foreground bg-muted p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
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
