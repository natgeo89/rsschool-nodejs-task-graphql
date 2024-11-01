import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberType } from './memberTypes.js';
import { GQLField } from './types/general.js';

export const Profile = new GraphQLObjectType({
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
    },
  },
});



export const profilesField: GQLField = {
  type: new GraphQLList(Profile),
  resolve: async (_source, _args, { prisma }) => {
    return prisma.profile.findMany();
  },
};

export const profileField: GQLField = {
  type: Profile,
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
    })
  },
};