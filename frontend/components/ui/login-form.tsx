'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [mobilePhone, setMobilePhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_phone: mobilePhone, password }),
      })

      const data = await response.json()

      if (response.status === 401) {
        toast.error(data.error || 'Thông tin đăng nhập không đúng', {
          style: { background: '#dc2626', color: '#fff' },
          duration: 3000,
        })
        setError(data.error)
        return
      }

      if (response.status === 500) {
        toast.error('Lỗi máy chủ, vui lòng thử lại sau.', {
          style: { background: '#dc2626', color: '#fff' },
          duration: 3000,
        })
        setError('Đã xảy ra lỗi máy chủ.')
        return
      }

      if (!response.ok) {
        toast.error(data.error || 'Đăng nhập thất bại', {
          style: { background: '#dc2626', color: '#fff' },
          duration: 3000,
        })
        setError(data.error || 'Lỗi không xác định')
        return
      }

      // Thành công
      toast.success('Đăng nhập thành công!', {
        style: { background: '#28a745', color: '#fff' },
        duration: 3000,
      })
      console.log('User data:', data.user)
      console.log('Token:', data.token) // ✅ In token ra kiểm tra

      // Lưu token vào cookie
      document.cookie = `token=${data.token}; path=/;`
      // Chuyển hướng
      router.push('/dashboard')
    } catch (err) {
      toast.error('Không thể kết nối đến máy chủ.', {
        style: { background: '#dc2626', color: '#fff' },
        duration: 3000,
      })
      setError('Không thể kết nối đến máy chủ.')
      console.error('Login error:', err)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your mobile phone number and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mobilePhone">Mobile Phone</Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  placeholder="0909999999"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <span className="text-xs text-red-500">{error}</span>}
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Single Sign On
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
