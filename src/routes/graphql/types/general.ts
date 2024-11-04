import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { GraphQLFieldConfig } from 'graphql';

export interface GQLContext {
  prisma: PrismaClient;
  dataLoader: {
    userSubscribedTo: DataLoader<string, UserType[]>;
    subscribedToUser: DataLoader<string, UserType[]>;
    posts: DataLoader<string, PostType[]>;
    profile: DataLoader<string, ProfileType>;
    memberType: DataLoader<string, MemberType>;
  };
}

export type GQLField<
  SourceType = unknown,
  ArgsType = { id: string },
> = GraphQLFieldConfig<SourceType, GQLContext, ArgsType>;

export interface UserType {
  id: string;
  name: string;
  balance: number;
}

export interface PostType {
  id: string;
  title: string;
  content: string;
}

export interface ProfileType {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
}

export interface MemberType {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}
