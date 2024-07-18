import type { PostComment, Image } from './Common'
import type { User } from './User'

export interface PhotoPost {
  id: number
  title: string
  likes: number
  views: number
  description: string
  location: string
  geometry: {
    type: 'point'
    coordinates: number[]
  }
  comments: PostComment[]
  images?: Image[]
  imageIds?: number[]
  authorId: number
  author: User
  isEdit: boolean
  createdAt: string
}

export interface CommunityPost {
  id?: number
  title: string
  authorId: number
  author?: User
  content: any
  imageIds?: number[]
  likes?: number
  views?: number
  topicTags: string[]
  comments?: CommunityComment[]
  isEdit?: boolean
  createdAt?: string
}

export interface CommunityComment {
  id: number
  postId: number
  authorId: number
  content: string
  post: CommunityPost
  author: User
}
