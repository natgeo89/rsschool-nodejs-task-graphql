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
import {
  GQLContext,
  MemberType,
  PostType,
  ProfileType,
  UserType,
} from './types/general.js';
import depthLimit from 'graphql-depth-limit';
import DataLoader from 'dataloader';

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

      const userSubscribedToLoader = new DataLoader<string, UserType[]>(
        async (usersIds: readonly string[]) => {
          const authors = await prisma.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: {
                    in: [...usersIds],
                  },
                },
              },
            },
            include: {
              subscribedToUser: true,
            },
          });

          return usersIds.map((userId) => {
            return authors.filter((author) => {
              return author.subscribedToUser.find(
                ({ subscriberId }) => subscriberId === userId,
              );
            });
          });
        },
      );

      const subscribedToUserLoader = new DataLoader<string, UserType[]>(
        async (usersIds: readonly string[]) => {
          const subscribers = await prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: {
                    in: [...usersIds],
                  },
                },
              },
            },
            include: {
              userSubscribedTo: true,
            },
          });

          return usersIds.map((userId) => {
            return subscribers.filter((sub) => {
              return sub.userSubscribedTo.find(({ authorId }) => authorId === userId);
            });
          });
        },
      );

      const postsLoader = new DataLoader<string, PostType[]>(
        async (usersIds: readonly string[]) => {
          const posts = await prisma.post.findMany({
            where: {
              authorId: {
                in: [...usersIds],
              },
            },
          });

          return usersIds.map((userId) => {
            return posts.filter((post) => post.authorId === userId) || [];
          });
        },
      );

      const profileLoader = new DataLoader<string, ProfileType | null>(
        async (usersIds: readonly string[]) => {
          const profiles = await prisma.profile.findMany({
            where: {
              userId: {
                in: [...usersIds],
              },
            },
          });

          return usersIds.map((userId) => {
            return profiles.find((profile) => profile.userId === userId) || null;
          });
        },
      );

      const memberTypeLoader = new DataLoader<string, MemberType>(
        async (memberTypeIds: readonly string[]) => {
          const memberTypes = await prisma.memberType.findMany({
            where: {
              id: {
                in: [...memberTypeIds],
              },
            },
          });

          return memberTypeIds.map((memberTypeId) => {
            return (
              memberTypes.find((type) => type.id === memberTypeId) ||
              Error('member type not found')
            );
          });
        },
      );

      return graphql({
        schema: schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: {
          prisma,
          dataLoader: {
            userSubscribedTo: userSubscribedToLoader,
            subscribedToUser: subscribedToUserLoader,
            posts: postsLoader,
            profile: profileLoader,
            memberType: memberTypeLoader,
          },
        },
      });
    },
  });
};

export default plugin;
