export interface PostComment {
    id?: number
    postId?: number
    articleId?: number
    authorId: number
    content: string
    likes?: number
    createdAt?: string
    updateAt?: Date
}

export interface Image {
    id?: number
    url: string
    publicId: number
}

export interface Dialog {
    title: string,
    content: string,
    cancelButton?: boolean
    warringStyle?: boolean
}
