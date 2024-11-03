import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';
import { GQLContext, GQLField } from './types/general.js';
import { Prisma } from '@prisma/client';

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
      resolve: async (source, _args, { prisma }) => {
        const users = await prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: source.id,
              },
            },
          },
        });

        return users;
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (source, _args, { prisma }) => {
        const users = await prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: source.id,
              },
            },
          },
        });

        return users;
      },
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

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  },
});

export const CREATE_USER: GQLField<unknown, { dto: Prisma.UserCreateInput }> = {
  type: UserType,
  args: {
    dto: {
      type: new GraphQLNonNull(CreateUserInput),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    const newUser = await prisma.user.create({
      data: args.dto,
    });

    return newUser;
  },
};

export const DELETE_USER: GQLField = {
  type: new GraphQLNonNull(GraphQLString),
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    await prisma.user.delete({
      where: {
        id: args.id,
      },
    });

    return 'deletedUser';
  },
};

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
  },
});

export const CHANGE_USER: GQLField<unknown, { id: string; dto: Prisma.UserUpdateInput }> = {
  type: new GraphQLNonNull(UserType),
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(ChangeUserInput),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    const updatedUser = await prisma.user.update({
      where: { id: args.id},
      data: args.dto,
    });

    return updatedUser;
  },
};

export const USER_SUBSCRIBE_TO_AUTHOR: GQLField<unknown, { userId: string; authorId: string }> = {
  type: new GraphQLNonNull(GraphQLString),
  args: {
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_source, args, { prisma }) => {
     await prisma.subscribersOnAuthors.create({
      data: {
        subscriberId: args.userId,
        authorId: args.authorId,
      },
    });

    return 'user subscribed to author';
  },
};

export const USER_UNSUBSCRIBE_FROM_AUTHOR: GQLField<unknown, { userId: string; authorId: string }> = {
  type: new GraphQLNonNull(GraphQLString),
  args: {
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_source, args, { prisma }) => {
     await prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      },
    });

    return 'user subscribed to author';
  },
};