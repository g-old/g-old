/* eslint-disable import/prefer-default-export */

/*eslint-disable */

throw Error("TO IMPLEMENT");

import { normalize } from "normalizr";
import {
  LOAD_COMMENTS_START,
  LOAD_COMMENTS_SUCCESS,
  LOAD_COMMENTS_ERROR,
  CREATE_COMMENT_START,
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_ERROR,
} from "../constants";
import {
  comment as commentSchema,
  commentList as commentListSchema,
} from "../store/schema";
import { getIsDiscussionFetching } from "../reducers";
