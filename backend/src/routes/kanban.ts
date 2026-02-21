import { Router, Request, Response } from 'express';
import kanbanService from '../services/kanban.js';

const router = Router();

// Get kanban board
router.get('/kanban', async (req: Request, res: Response): Promise<void> => {
  try {
    const board = await kanbanService.getBoard();
    if (!board) {
      res.status(500).json({ error: 'Failed to load kanban board' });
      return;
    }
    res.json(board);
  } catch (error) {
    console.error('Error in /api/kanban:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get kanban columns
router.get('/kanban/columns', async (req: Request, res: Response): Promise<void> => {
  try {
    const columns = await kanbanService.getColumns();
    res.json({
      count: columns.length,
      columns
    });
  } catch (error) {
    console.error('Error in /api/kanban/columns:', error);
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

// Get kanban tasks (optionally filtered by column)
router.get('/kanban/tasks', async (req: Request, res: Response): Promise<void> => {
  try {
    const column = req.query.column as string | undefined;
    const tasks = column 
      ? await kanbanService.getTasksByColumn(column)
      : await kanbanService.getTasks();
    res.json({
      count: tasks.length,
      column: column || 'all',
      tasks
    });
  } catch (error) {
    console.error('Error in /api/kanban/tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get kanban activity log
router.get('/kanban/activity', async (req: Request, res: Response): Promise<void> => {
  try {
    const activity = await kanbanService.getActivityLog();
    res.json({
      count: activity.length,
      activity
    });
  } catch (error) {
    console.error('Error in /api/kanban/activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Add a new task
router.post('/kanban/tasks', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, column } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const task = await kanbanService.addTask(title, column);
    if (!task) {
      res.status(500).json({ error: 'Failed to add task' });
      return;
    }
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error in POST /api/kanban/tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move a task to a different column
router.patch('/kanban/tasks/:id/move', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const column = req.body.column as string;
    
    if (!column) {
      res.status(400).json({ error: 'Column is required' });
      return;
    }
    
    const success = await kanbanService.moveTask(id, column);
    if (!success) {
      res.status(404).json({ error: 'Task not found or failed to move' });
      return;
    }
    
    res.json({ success: true, taskId: id, column });
  } catch (error) {
    console.error('Error in PATCH /api/kanban/tasks/:id/move:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task
router.delete('/kanban/tasks/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const success = await kanbanService.deleteTask(id);
    
    if (!success) {
      res.status(404).json({ error: 'Task not found or failed to delete' });
      return;
    }
    
    res.json({ success: true, taskId: id });
  } catch (error) {
    console.error('Error in DELETE /api/kanban/tasks/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
