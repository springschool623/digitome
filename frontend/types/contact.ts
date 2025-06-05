export type Contact = {
  id: number
  rank_id: number
  position_id: number
  name: string
  department_id: number
  location_id: number
  address: string
  military_phone_no: string
  civilian_phone_no: string
  mobile_no: string
}

export type ContactImport = {
  rank_name: string
  position_name: string
  name: string
  department_name: string
  location_name: string
  address: string
  military_phone_no: string
  civilian_phone_no: string
  mobile_no: string
}
