export class CollectionMeta {
  current: string; // TODO: make these objects following my github post.
  previous: string;
  next: string;
  count: number; // the number of items in the collection returned
  total: number; // the total number available (i.e. there might be more still to get)
  first: string; // the Bham API probably won't include this
  last: string; // the Bham API probably won't include this
}