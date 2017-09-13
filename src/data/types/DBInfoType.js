import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
} from 'graphql';
import knex from '../knex';
import TableType from './TableType';

const DBInfoType = new ObjectType({
  name: 'DBInfoType',

  fields: {
    size: {
      type: GraphQLString,
      resolve() {
        return knex
          .raw(
            'SELECT pg_size_pretty( pg_database_size( current_database() ) ) As human_size',
          )
          .then(res => res.rows[0].human_size);
        /* return knex.raw( `SELECT schemaname, tablename,
pg_size_pretty(size) AS size_pretty,
pg_size_pretty(total_size) AS total_size_pretty
 FROM (SELECT *,
 pg_relation_size(schemaname||'.'||tablename) AS size,
 pg_total_relation_size(schemaname||'.'||tablename) AS total_size
FROM pg_tables) AS TABLES
 WHERE schemaname='public'
 ORDER BY total_size DESC`)*/
      },
    },
    rwRation: {
      type: GraphQLInt,
    },
    cacheHitRate: {
      // should be 99
      type: GraphQLFloat,
      resolve() {
        return knex
          .raw(
            `SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit)  as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM
  pg_statio_user_tables;`,
          )
          .then(res => res.rows[0].ratio);
      },
    },
    indexUsage: {
      // should be 99 over 10000 entries
      type: new GraphQLList(TableType),
      resolve() {
        return knex
          .raw(
            `SELECT
  relname,
  100 * idx_scan / (seq_scan + idx_scan) percent_of_times_index_used,
  n_live_tup rows_in_table
FROM
  pg_stat_user_tables
WHERE
    seq_scan + idx_scan > 0
ORDER BY
  n_live_tup DESC;`,
          )
          .then(res => res.rows);
      },
    },
  },
});
export default DBInfoType;
