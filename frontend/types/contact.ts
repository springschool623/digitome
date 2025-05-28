export type Contact = {
  id: number
  rank_id: number
  position_id: number
  manager: string
  department_id: number
  location_id: number
  address: string
  military_postal_code: string
  mobile_no: string
}

export type ContactImport = {
  rank_name: string
  position_name: string
  manager: string
  department_name: string
  location_name: string
  address: string
  military_postal_code: string
  mobile_no: string
}
