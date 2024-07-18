import type { PostComment } from "./Common"

export interface Article {
  id: number
  title: string
  subTitle: string
  createdAt: string
  views: number
  likes: number
  content: any
  topicTags: string[]
  coverImage: string
  comments: PostComment[]
}

export interface CreateCommentData {
  articleId: number
  authorId: number
  content: string
}
