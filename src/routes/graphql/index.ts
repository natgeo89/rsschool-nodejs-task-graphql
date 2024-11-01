import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLObjectType, GraphQLSchema, parse, validate } from 'graphql';
import { memberTypeField, memberTypesField } from './memberTypes.js';
import { POST, POSTS } from './posts.js';
import { PROFILE, PROFILES } from './profiles.js';
import { USER, USERS } from './users.js';
import { GQLContext } from './types/general.js';
import depthLimit from 'graphql-depth-limit';

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
      const document = parse(req.body.query);
      const validationErrors = validate(schema, document, [depthLimit(5)]);

      if (validationErrors.length > 0) {
        return { errors: validationErrors };
      }

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
