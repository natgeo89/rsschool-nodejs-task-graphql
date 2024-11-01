import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberType } from './memberTypes.js';
import { GQLContext, GQLField } from './types/general.js';

export const ProfileType = new GraphQLObjectType<{ memberTypeId: string }, GQLContext>({
  name: 'Profile',
  fields: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (source, _args, { prisma }) => {
        const memberType = await prisma.memberType.findUnique({
          where: {
            id: source.memberTypeId,
          },
        });

        return memberType;
      },
    },
  },
});

export const PROFILES: GQLField = {
  type: new GraphQLList(ProfileType),
  resolve: async (_source, _args, { prisma }) => {
    return prisma.profile.findMany();
  },
};

export const PROFILE: GQLField = {
  type: ProfileType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    return await prisma.profile.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};
