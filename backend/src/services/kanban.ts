import fs from 'fs/promises';
import path from 'path';

const KANBAN_PATH = process.env.KANBAN_PATH || '/workspace/agents/communications/workspace/.kanban/board.json';

export interface KanbanTask {
  id: string;
  title: string;
  column: string;
}

export interface KanbanActivity {
  timestamp: string;
  event: string;
  detail?: string;
}

export interface KanbanBoard {
  project: string;
  created_at: string;
  updated_at: string;
  columns: string[];
  tasks: KanbanTask[];
  activity_log: KanbanActivity[];
}

class KanbanService {
  private boardPath: string;

  constructor() {
    this.boardPath = KANBAN_PATH;
  }

  async getBoard(): Promise<KanbanBoard | null> {
    try {
      const data = await fs.readFile(this.boardPath, 'utf-8');
      const board = JSON.parse(data) as KanbanBoard;
      return board;
    } catch (error) {
      console.error('Error reading kanban board:', error);
      return null;
    }
  }

  async getTasks(): Promise<KanbanTask[]> {
    const board = await this.getBoard();
    return board?.tasks || [];
  }

  async getTasksByColumn(column: string): Promise<KanbanTask[]> {
    const tasks = await this.getTasks();
    return tasks.filter(task => task.column === column);
  }

  async getColumns(): Promise<string[]> {
    const board = await this.getBoard();
    return board?.columns || [];
  }

  async getActivityLog(): Promise<KanbanActivity[]> {
    const board = await this.getBoard();
    return board?.activity_log || [];
  }

  async addTask(title: string, column: string = 'Proposed'): Promise<KanbanTask | null> {
    try {
      const board = await this.getBoard();
      if (!board) return null;

      const newTask: KanbanTask = {
        id: `task-${Date.now()}`,
        title,
        column
      };

      board.tasks.push(newTask);
      board.updated_at = new Date().toISOString();
      board.activity_log.push({
        timestamp: board.updated_at,
        event: 'TASK_ADDED',
        detail: `Added task: ${title}`
      });

      await fs.writeFile(this.boardPath, JSON.stringify(board, null, 2));
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  }

  async moveTask(taskId: string, newColumn: string): Promise<boolean> {
    try {
      const board = await this.getBoard();
      if (!board) return false;

      const taskIndex = board.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return false;

      const oldColumn = board.tasks[taskIndex].column;
      board.tasks[taskIndex].column = newColumn;
      board.updated_at = new Date().toISOString();
      board.activity_log.push({
        timestamp: board.updated_at,
        event: 'TASK_MOVED',
        detail: `Moved task from ${oldColumn} to ${newColumn}`
      });

      await fs.writeFile(this.boardPath, JSON.stringify(board, null, 2));
      return true;
    } catch (error) {
      console.error('Error moving task:', error);
      return false;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const board = await this.getBoard();
      if (!board) return false;

      const taskIndex = board.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return false;

      const taskTitle = board.tasks[taskIndex].title;
      board.tasks.splice(taskIndex, 1);
      board.updated_at = new Date().toISOString();
      board.activity_log.push({
        timestamp: board.updated_at,
        event: 'TASK_DELETED',
        detail: `Deleted task: ${taskTitle}`
      });

      await fs.writeFile(this.boardPath, JSON.stringify(board, null, 2));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }
}

export default new KanbanService();
