import { PrismaClient, User } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { invokeAsyncAndPrintTimeConsuming } from "../util";

async function omitModelGlobally() {
  // When the Preview feature is enabled, you’re able to define fields to omit when instantiating Prisma Client.
  const prisma = new PrismaClient({
    omit: {
      user: {
        password: true,
      },
    },
  });

  let user: Partial<User> = await prisma.user.findFirstOrThrow();

  console.info(user);

  // You can overwrite it
  user = await prisma.user.findFirstOrThrow({
    omit: {
      password: false,
      email: true,
    },
  });

  console.info(user);
}

async function createManyAndReturn() {
  const prisma = new PrismaClient();
  const numberOfRows = faker.number.int({ min: 1000, max: 2000 });

  console.info("createManyAndReturn");
  // It works similarly to createMany() but uses a RETURNING clause in the SQL query to retrieve the records that were just created.
  // Because createManyAndReturn() uses the RETURNING clause, it is only supported by PostgreSQL, CockroachDB, and SQLite databases.
  await invokeAsyncAndPrintTimeConsuming(
    prisma.user.createManyAndReturn({
      data: new Array(numberOfRows).fill(0).map((_, index) => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.firstName(),
        email: index + faker.internet.email(),
        password: faker.internet.password(),
      })),
    })
  );

  console.info("createMany");
  // Faster, but does not return user
  await invokeAsyncAndPrintTimeConsuming(
    prisma.user.createMany({
      data: new Array(numberOfRows).fill(0).map(() => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })),
    })
  );
}

async function optimizedRelationQueries() {
  const prisma = new PrismaClient();
  const numberOfRows = faker.number.int({ min: 1000, max: 2000 });
  const user = await prisma.user.findFirstOrThrow();

  await prisma.post.createMany({
    data: new Array(numberOfRows).fill(0).map(() => ({
      title: faker.lorem.lines(1),
      description: faker.lorem.paragraph(),
      userId: user.id,
    })),
  });

  // join (default): Sends a single query to the database and joins the data on the database-level.
  // This feature is currently available on PostgreSQL, CockroachDB and MySQL.
  // We can't test with sqlite yet
  await invokeAsyncAndPrintTimeConsuming(
    prisma.post.findMany({
      // relationLoadStrategy: 'join', // or 'query'
      include: {
        author: true,
      },
    })
  );
}

(async () => {
  if (false) await omitModelGlobally();
  if (false) await createManyAndReturn();
  if (false) await optimizedRelationQueries();
})();
