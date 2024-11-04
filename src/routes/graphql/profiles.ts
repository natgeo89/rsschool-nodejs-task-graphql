import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberType, MemberTypeId } from './memberTypes.js';
import { GQLContext, GQLField } from './types/general.js';
import { Prisma } from '@prisma/client';

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
      resolve: async (source, _args, { dataLoader }) => {
        const memberType = await dataLoader.memberType.load(source.memberTypeId)

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

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    memberTypeId: {
      type: new GraphQLNonNull(MemberTypeId),
    },
  },
});

export const CREATE_PROFILE: GQLField<unknown, { dto: Prisma.ProfileCreateInput }> = {
  type: ProfileType,
  args: {
    dto: {
      type: new GraphQLNonNull(CreateProfileInput),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    const newProfile = await prisma.profile.create({
      data: args.dto,
    });

    return newProfile;
  },
};

export const DELETE_PROFILE: GQLField = {
  type: new GraphQLNonNull(GraphQLString),
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_source, args, { prisma }) => {
    await prisma.profile.delete({
      where: {
        id: args.id,
      },
    });

    return 'deletedProfile';
  },
};

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: {
      type: GraphQLBoolean,
    },
    yearOfBirth: {
      type: GraphQLInt,
    },
    memberTypeId: {
      type: MemberTypeId,
    },
  },
});

export const CHANGE_PROFILE: GQLField<unknown, { id: string; dto: Prisma.ProfileUpdateInput }> =
  {
    type: new GraphQLNonNull(ProfileType),
    args: {
      id: {
        type: new GraphQLNonNull(UUIDType),
      },
      dto: {
        type: new GraphQLNonNull(ChangeProfileInput),
      },
    },
    resolve: async (_source, args, { prisma }) => {
      const updatedProfile = await prisma.profile.update({
        where: { id: args.id },
        data: args.dto,
      });

      return updatedProfile;
    },
  };
