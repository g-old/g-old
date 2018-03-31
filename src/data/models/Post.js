// @flow
class Post {
  id: string;
  groupId: string;
  verb: string;
  type: string; // SubjectType
  subjectId: string;

  constructor(data: Post) {
    this.id = data.id;
    this.groupId = data.groupId;
    this.verb = data.verb;
    this.type = data.type;
    this.subjectId = data.subjectId;
  }
}

export default Post;
