import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';

import type { EntityManager } from '@mikro-orm/core';

import { User, Board, BoardDetails, List, Card } from '../entities';

const SALT_ROUNDS = 10;

export class DatabaseSeeder extends Seeder {
  // eslint-disable-next-line class-methods-use-this
  async run(em: EntityManager): Promise<void> {
    const hashedPassword = await bcrypt.hash('admin', SALT_ROUNDS);

    // Users
    const user = em.create(User, {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
    });
    await em.persistAndFlush(user);

    // Boards
    const board = em.create(Board, { name: 'My Project', ownerId: user._id });
    await em.persistAndFlush(board);
    user.boards.add(board);

    const boardDetails = em.create(BoardDetails, {
      boardId: board._id,
      listIds: [],
      lists: [],
      cards: [],
    });
    await em.persistAndFlush(boardDetails);

    // Lists
    const backlogList = new List('Backlog', board._id);
    const todoList = new List('Todo', board._id);
    const doneList = new List('Done', board._id);
    boardDetails.listIds.push(backlogList._id, todoList._id, doneList._id);
    boardDetails.lists.push(backlogList, todoList, doneList);

    // Cards
    const backlogCards = ['Write tests', 'Refactor'];
    backlogCards.forEach((name) => {
      const card = new Card(name, backlogList._id, board._id);
      boardDetails.cards.push(card);
      backlogList.cardIds.push(card._id);
    });
  }
}
