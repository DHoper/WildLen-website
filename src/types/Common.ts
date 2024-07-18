export interface PostComment {
    id?: number
    postId?: number
    articleId?: number
    authorId: number
    content: string
    likes?: number
    createdAt?: Date
    updateAt?: Date
}

export interface Image {
    id?: number
    url: string
    filename: string
    photoPostId?: number
}

export interface Dialog {
    title: string,
    content: string,
    cancelButton: boolean
    warringStyle?: boolean
}
