export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  boards?: Board[];
}

export interface Board {
  id: string;
  name: string;
  ownerId: User['id'];
  users?: User[];
}

export interface BoardDetails {
  id: string;
  boardId: Board['id'];
  listIds: List['id'][];
  lists: List[];
  cards: Card[];
}

export interface List {
  id: string;
  name: string;
  boardId: Board['id'];
  cardIds: Card['id'][];
}

export interface Card {
  id: string;
  name: string;
  boardId: Board['id'];
  listId: List['id'];
}
