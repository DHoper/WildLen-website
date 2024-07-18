import type { User } from "./User";

export interface VoteOption {
    id?: number;
    text: string;
    voteId?: number;
    userVotes?: UserVote[]
}

export interface Vote {
    id?: number;
    authorId?: number;
    author?: User;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    isEnd?: boolean;
    participantCount?: number;
    options: VoteOption[];
    createdAt?: Date;
    updatedAt?: Date;
    userVotes?: UserVote[];
    userHasVoted?: boolean
}

export interface UserVote {
    id?: number;
    userId: number;
    voteId?: number;
    voteOptionId: number;
    createdAt?: Date;
    updatedAt?: Date;
}
