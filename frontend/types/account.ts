import { Role } from './role'

export type Account = {
  id: number
  mobile_no: string
  password?: string
  status: string
  created_by?: number
  created_by_name?: string
  updated_at?: string
  roles?: Role[]
}
