import { createSchema, createYoga } from 'graphql-yoga';

const typeDefs = /* GraphQL */ `
  type Query {
    health: SystemHealth!
  }

  type SystemHealth {
    status: String!
    service: String!
  }
`;

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: {
        health: () => ({
          status: 'ok',
          service: 'api',
        }),
      },
    },
  }),
  graphqlEndpoint: '/graphql',
  landingPage: false,
  graphiql: false,
  maskedErrors: process.env.NODE_ENV === 'production',
});

export async function executeGraphql(input: {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}) {
  const enveloped = yoga.getEnveloped();
  const document = enveloped.parse(input.query);
  const errors = enveloped.validate(enveloped.schema, document);
  if (errors.length > 0) {
    return { errors };
  }
  return enveloped.execute({
    schema: enveloped.schema,
    document,
    variableValues: input.variables,
    operationName: input.operationName,
  });
}
