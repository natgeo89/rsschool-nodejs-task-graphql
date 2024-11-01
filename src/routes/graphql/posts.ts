import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { GQLField } from './types/general.js';

export const PostType = new GraphQLObjectType({
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

export const POSTS: GQLField = {
  type: new GraphQLList(PostType),
  resolve: async (_source, _args, { prisma }) => {
    return prisma.post.findMany();
  },
};

export const POST: GQLField = {
  type: PostType,
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
