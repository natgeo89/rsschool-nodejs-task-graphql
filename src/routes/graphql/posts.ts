import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { GQLField } from './types/general.js';

export const Post = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

export const postsField: GQLField = {
  type: new GraphQLList(Post),
  resolve: async (_source, _args, { prisma }) => {
    return prisma.post.findMany();
  },
};

export const postField: GQLField = {
  type: Post,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    return prisma.post.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};
