import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';
import { GQLContext, GQLField } from './types/general.js';

export const UserType: GraphQLObjectType = new GraphQLObjectType<
  { id: string },
  GQLContext
>({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: ProfileType,
      resolve: async (source, _args, { prisma }) => {
        const profile = await prisma.profile.findUnique({
          where: {
            userId: source.id,
          },
        });

        return profile;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: async (source, _args, { prisma }) => {
        const posts = await prisma.post.findMany({
          where: {
            authorId: source.id,
          },
        });

        return posts;
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
    },
  }),
});

export const USERS: GQLField = {
  type: new GraphQLList(UserType),
  resolve: async (_source, _args, { prisma }) => {
    return prisma.user.findMany();
  },
};

export const USER: GQLField = {
  type: UserType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: args.id,
      },
    });

    return user;
  },
};
