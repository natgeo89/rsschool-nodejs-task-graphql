import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { GQLField } from './types/general.js';

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: {
      value: 'BASIC',
    },
    BUSINESS: {
      value: 'BUSINESS',
    },
  },
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: {
      type: new GraphQLNonNull(MemberTypeId),
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
});

export const MEMBER_TYPES: GQLField = {
  type: new GraphQLList(MemberType),
  resolve: async (_source, _args, { prisma }) => {
    return prisma.memberType.findMany();
  },
};

export const MEMBER_TYPE: GQLField = {
  type: MemberType,
  args: {
    id: {
      type: new GraphQLNonNull(MemberTypeId),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    return await prisma.memberType.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};
