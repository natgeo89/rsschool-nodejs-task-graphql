import { PrismaClient } from '@prisma/client';
import { GraphQLFieldConfig } from 'graphql';

export interface GQLContext {
  prisma: PrismaClient;
}

export type GQLField<ArgsType = { id: string }> = GraphQLFieldConfig<
  unknown,
  GQLContext,
  ArgsType
>;
