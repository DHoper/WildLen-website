export interface User {
  id: number
  email: string
  username: string
  password?: string
  profile?: Profile
}

export interface Profile {
  id?: number
  userId?: number
  selectedAvatarIndex: number
  selectedTags: string[]
  intro?: string
  interestedTopics?: string[]
  user?: User
}
