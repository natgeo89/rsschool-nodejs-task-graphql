import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { GQLField } from './types/general.js';
import { Prisma } from '@prisma/client';

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

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
});

export const CREATE_POST: GQLField<unknown, { dto: Prisma.PostCreateInput }> = {
  type: PostType,
  args: {
    dto: {
      type: new GraphQLNonNull(CreatePostInput),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    const newPost = await prisma.post.create({
      data: args.dto,
    });

    return newPost;
  },
};

export const DELETE_POST: GQLField = {
  type: new GraphQLNonNull(GraphQLString),
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    await prisma.post.delete({
      where: {
        id: args.id,
      },
    });

    return 'deletedPost';
  },
};

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
    },
  },
});

export const CHANGE_POST: GQLField<unknown, { id: string; dto: Prisma.PostUpdateInput }> = {
  type: new GraphQLNonNull(PostType),
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(ChangePostInput),
    }
  },
  resolve: async (_source, args, { prisma }) => {
    const updatedPost = await prisma.post.update({
      where: { id: args.id },
      data: args.dto,
    })

    return updatedPost;
  },
};
