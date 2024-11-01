import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { memberTypeField, memberTypesField } from './memberTypes.js';
import { POST, POSTS } from './posts.js';
import { PROFILE, PROFILES } from './profiles.js';
import { USER, USERS } from './users.js';
import { GQLContext } from './types/general.js';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType<unknown, GQLContext>({
    name: 'RootQueryType',
    fields: {
      memberTypes: memberTypesField,
      memberType: memberTypeField,

      posts: POSTS,
      post: POST,

      users: USERS,
      user: USER,

      profiles: PROFILES,
      profile: PROFILE,
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
