import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const GameHistoryPlain = t.Object(
  {
    id: t.String(),
    memberId: t.String(),
    gameId: t.String(),
    score: t.Integer(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const GameHistoryRelations = t.Object(
  {},
  { additionalProperties: false },
);

export const GameHistoryPlainInputCreate = t.Object(
  { score: t.Integer() },
  { additionalProperties: false },
);

export const GameHistoryPlainInputUpdate = t.Object(
  { score: t.Optional(t.Integer()) },
  { additionalProperties: false },
);

export const GameHistoryRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const GameHistoryRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const GameHistoryWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          memberId: t.String(),
          gameId: t.String(),
          score: t.Integer(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "GameHistory" },
  ),
);

export const GameHistoryWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
          additionalProperties: false,
        }),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.String(),
              memberId: t.String(),
              gameId: t.String(),
              score: t.Integer(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "GameHistory" },
);

export const GameHistorySelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      memberId: t.Boolean(),
      gameId: t.Boolean(),
      score: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const GameHistoryInclude = t.Partial(
  t.Object({ _count: t.Boolean() }, { additionalProperties: false }),
);

export const GameHistoryOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      memberId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      gameId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      score: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const GameHistory = t.Composite(
  [GameHistoryPlain, GameHistoryRelations],
  { additionalProperties: false },
);

export const GameHistoryInputCreate = t.Composite(
  [GameHistoryPlainInputCreate, GameHistoryRelationsInputCreate],
  { additionalProperties: false },
);

export const GameHistoryInputUpdate = t.Composite(
  [GameHistoryPlainInputUpdate, GameHistoryRelationsInputUpdate],
  { additionalProperties: false },
);
