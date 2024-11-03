import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLObjectType, GraphQLSchema, parse, validate } from 'graphql';
import { MEMBER_TYPE, MEMBER_TYPES } from './memberTypes.js';
import { CHANGE_POST, CREATE_POST, DELETE_POST, POST, POSTS } from './posts.js';
import {
  CHANGE_PROFILE,
  CREATE_PROFILE,
  DELETE_PROFILE,
  PROFILE,
  PROFILES,
} from './profiles.js';
import {
  CHANGE_USER,
  CREATE_USER,
  DELETE_USER,
  USER,
  USER_SUBSCRIBE_TO_AUTHOR,
  USER_UNSUBSCRIBE_FROM_AUTHOR,
  USERS,
} from './users.js';
import { GQLContext } from './types/general.js';
import depthLimit from 'graphql-depth-limit';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType<unknown, GQLContext>({
    name: 'RootQueryType',
    fields: {
      memberTypes: MEMBER_TYPES,
      memberType: MEMBER_TYPE,

      posts: POSTS,
      post: POST,

      users: USERS,
      user: USER,

      profiles: PROFILES,
      profile: PROFILE,
    },
  }),

  mutation: new GraphQLObjectType<unknown, GQLContext>({
    name: 'Mutations',
    fields: {
      createUser: CREATE_USER,
      createPost: CREATE_POST,
      createProfile: CREATE_PROFILE,

      deletePost: DELETE_POST,
      deleteProfile: DELETE_PROFILE,
      deleteUser: DELETE_USER,

      changePost: CHANGE_POST,
      changeProfile: CHANGE_PROFILE,
      changeUser: CHANGE_USER,

      subscribeTo: USER_SUBSCRIBE_TO_AUTHOR,
      unsubscribeFrom: USER_UNSUBSCRIBE_FROM_AUTHOR,
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
