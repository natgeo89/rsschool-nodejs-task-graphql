import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { memberTypeField, memberTypesField } from './memberTypes.js';
import { postField, postsField } from './posts.js';
import { profileField, profilesField } from './profiles.js';
import { userField, usersField } from './users.js';
import { GQLContext } from './types/general.js';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType<unknown, GQLContext>({
    name: 'Query',
    fields: {
      memberTypes: memberTypesField,
      memberType: memberTypeField,

      posts: postsField,
      post: postField,

      users: usersField,
      user: userField,

      profiles: profilesField,
      profile: profileField,
    },
  }),
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      return graphql({
        schema: schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: {
          prisma,
        },
      });
    },
  });
};

export default plugin;
