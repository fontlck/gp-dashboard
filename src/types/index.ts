export type User = {
  id: string
  email: string
  name?: string
  role: "admin" | "partner"
}
evVrt type GPReport = {
  id: string
  userId: string
  date: Date
  data: any // CSV parsed data
}
