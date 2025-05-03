import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/login') // Chuyển hướng sang trang login
}
