import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLObjectType as ObjectType,
} from 'graphql';

const CommunicationType = new ObjectType({
  name: 'Communication',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    parentId: {
      type: GraphQLID,
    },

    textRaw: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
      resolve: parent => parent.textHtml || parent.textRaw,
    },

    replyable: {
      type: GraphQLBoolean,
    },

    // with recursive temp (id, text_html, parent_id) as (select id, text_html, parent_id from communications where id = 16 union all select communications.id, communications.text_html, communications.parent_id from messages join communications on messages.message_object_id = communications.id join temp on temp.parent_id = messages.id) select * from temp;

    createdAt: {
      type: GraphQLString,
    },
  }),
});
export default CommunicationType;
