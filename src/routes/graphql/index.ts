import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  parse,
  validate,
} from 'graphql';
import { memberTypeField, memberTypesField } from './memberTypes.js';
import { CREATE_POST, DELETE_POST, POST, POSTS } from './posts.js';
import { CREATE_PROFILE, DELETE_PROFILE, PROFILE, PROFILES } from './profiles.js';
import { CREATE_USER, DELETE_USER, USER, USERS } from './users.js';
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

  // type Mutations {
  //   createUser(dto: CreateUserInput!): User!
  //   createProfile(dto: CreateProfileInput!): Profile!
  //   createPost(dto: CreatePostInput!): Post!
  //   changePost(id: UUID!, dto: ChangePostInput!): Post!
  //   changeProfile(id: UUID!, dto: ChangeProfileInput!): Profile!
  //   changeUser(id: UUID!, dto: ChangeUserInput!): User!
  //   deleteUser(id: UUID!): String!
  //   deletePost(id: UUID!): String!
  //   deleteProfile(id: UUID!): String!
  //   subscribeTo(userId: UUID!, authorId: UUID!): String!
  //   unsubscribeFrom(userId: UUID!, authorId: UUID!): String!
  // }

  mutation: new GraphQLObjectType<unknown, GQLContext>({
    name: 'Mutations',
    fields: {
      createUser: CREATE_USER,
      createPost: CREATE_POST,
      createProfile: CREATE_PROFILE,

      deletePost: DELETE_POST,
      deleteProfile: DELETE_PROFILE,
      deleteUser: DELETE_USER,
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
