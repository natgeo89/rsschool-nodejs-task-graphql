import { PrismaClient } from '@prisma/client';
import { GraphQLFieldConfig } from 'graphql';

export interface GQLContext {
  prisma: PrismaClient;
}

export type GQLField<SourceType = unknown, ArgsType = { id: string }> = GraphQLFieldConfig<
  SourceType,
  GQLContext,
  ArgsType
>;
